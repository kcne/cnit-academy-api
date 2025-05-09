import prisma from "../prisma";
import createHttpError from "http-errors";
import { z } from "zod";
import { validateRequest } from "../middlewares/validate";

const roleRequestSchema = z.object({
  userId: z.number().int().positive(),
  coverLetter: z.string().min(20),
});

const validateCreateRoleRequest = validateRequest(roleRequestSchema);

enum RoleRequestStatus {
  pending = "PENDING",
  accepted = "ACCEPTED",
  denied = "DENIED",
}

const ONE_DAY = 24 * 60 * 60 * 1000;

async function getRoleRequests(pending: boolean) {
  const requests = await prisma.roleRequest.findMany({
    where: {
      status: pending ? RoleRequestStatus.pending : undefined,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return requests;
}

async function sendRoleRequest(data: z.infer<typeof roleRequestSchema>) {
  const existingRequest = await prisma.roleRequest.findFirst({
    where: { userId: data.userId },
  });

  if (existingRequest?.createdAt) {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    if (
      Date.now() - existingRequest.createdAt.getMilliseconds() >
      180 * ONE_DAY
    ) {
      throw createHttpError(
        400,
        "You already sent a request within the last 6 months!",
      );
    }
  }

  const roleRequest = await prisma.roleRequest.create({
    data: {
      ...data,
      status: RoleRequestStatus.pending,
    },
  });

  return roleRequest;
}

async function approveRoleRequest(roleRequestId: number) {
  const roleRequest = await prisma.roleRequest.findUnique({
    where: { id: roleRequestId },
  });

  if (!roleRequest) {
    throw createHttpError(404, "Role request not found");
  }

  await prisma.roleRequest.update({
    where: { id: roleRequestId },
    data: { status: RoleRequestStatus.accepted },
  });

  await prisma.user.update({
    where: { id: roleRequest.userId },
    data: {
      role: "INSTRUCTOR", // TODO: allow adding any role
    },
  });
}

async function declineRoleRequest(roleRequestId: number) {
  await prisma.roleRequest.findFirst({
    where: { id: roleRequestId },
  });

  await prisma.roleRequest.update({
    where: { id: roleRequestId },
    data: { status: RoleRequestStatus.denied },
  });
}

export {
  approveRoleRequest,
  declineRoleRequest,
  sendRoleRequest,
  getRoleRequests,
  validateCreateRoleRequest,
};
