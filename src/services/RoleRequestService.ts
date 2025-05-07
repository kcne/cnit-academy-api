import prisma from "../prisma";
import createHttpError from "http-errors";

export const getRoleRequests = async () => {
  try {
    const requests = await prisma.roleRequest.findMany({
      where: {
        status: "pending",
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const otherRequests = await prisma.roleRequest.findMany({
      where: {
        status: {},
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const allRequests = [...requests, ...otherRequests];

    return allRequests;
  } catch (error) {
    throw createHttpError(500, "Failed to fetch role requests");
  }
};

export const sendRoleRequest = async (
  userId: number,
  bio: string,
  age: string,
  photoURL: string,
  coverLetter: string,
  links: { key: string; value: string }[]
) => {
  try {
    const existingRequest = await prisma.roleRequest.findFirst({
      where: { userId },
    });

    if (existingRequest?.createdAt) {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      if (existingRequest.createdAt > sixMonthsAgo) {
        throw createHttpError(
          400,
          "You already sent a request within the last 6 months!"
        );
      }
    }

    const roleRequest = await prisma.roleRequest.create({
      data: {
        userId,
        bio,
        age,
        photoURL,
        coverLetter,
        links: {
          create: links.map((link) => ({
            key: link.key,
            value: link.value,
            user: { connect: { id: userId } },
          })),
        },
      },
      include: {
        links: true,
      },
    });

    return roleRequest;
  } catch (error) {
    console.error(error);
    throw createHttpError(500, "Failed to send role request");
  }
};

export const approveRoleRequest = async (roleRequestId: number) => {
  try {
    const roleRequest = await prisma.roleRequest.findUnique({
      where: { id: roleRequestId },
      include: {
        links: true,
      },
    });

    if (!roleRequest) {
      throw createHttpError(404, "Role request not found");
    }

    await prisma.roleRequest.update({
      where: { id: roleRequestId },
      data: { status: "approved" },
    });

    await prisma.professor.create({
      data: {
        userId: roleRequest.userId,
        bio: roleRequest.bio,
        age: roleRequest.age,
        photoURL: roleRequest.photoURL,
        coverLetter: roleRequest.coverLetter,
        links: {
          connect: roleRequest.links.map((link) => ({
            key_value_userId_roleRequestId: {
              key: link.key,
              value: link.value,
              userId: link.userId,
              roleRequestId: roleRequest.id,
            },
          })),
        },
      },
    });

    const professorRole = await prisma.role.findUnique({
      where: { name: "Professor" },
    });

    if (!professorRole) {
      throw createHttpError(400, "Professor role not found");
    }

    await prisma.user.update({
      where: { id: roleRequest.userId },
      data: {
        roles: {
          connect: { id: professorRole.id },
        },
      },
    });

    return { message: "Role request approved and professor created." };
  } catch (error) {
    console.error(error);
    throw createHttpError(500, "Failed to approve role request");
  }
};

export const declineRoleRequest = async (roleRequestId: number) => {
  try {
    const roleRequest = await prisma.roleRequest.findFirst({
      where: { id: roleRequestId },
    });

    await prisma.roleRequest.update({
      where: { id: roleRequestId },
      data: { status: "declined" },
    });

    return roleRequest;
  } catch (error) {
    console.log(error);
    throw createHttpError(500, "Failed to decline role request");
  }
};
