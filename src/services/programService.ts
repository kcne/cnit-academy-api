import { PrismaClient } from '@prisma/client';
import { Program } from '@prisma/client';
import { validateRequest } from '../middlewares/validate';
import { z } from 'zod';

const prisma = new PrismaClient();

const parseDate = (value: unknown): Date | undefined => {
    if(value instanceof Date){
        return value;
    }
    if(typeof value === 'string' || typeof value === 'number'){
        const date = new Date(value);
        if(!isNaN(date.getTime())){
            return date;
        }
    }
    return undefined;
}

const updProgramSchema = z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    founder: z.string().optional(),
    durationInDays: z.number().optional(),
    applicationDeadline: z.union([z.string(), z.date()]).transform((val) => parseDate(val)).optional(),
  }).transform((data) => ({
    ...data,
    applicationDeadline: parseDate(data.applicationDeadline ? parseDate(data.applicationDeadline): undefined)
  }));

const programSchema = z.object({
    title: z.string(),
    description: z.string(),
    founder: z.string(),
    durationInDays: z.number(),
    applicationDeadline: z.union([z.string(), z.date()]).transform((val) => parseDate(val)),
  }).transform((data) => ({
    ...data,
    applicationDeadline: parseDate(data.applicationDeadline)!
  }));

  const validateUpdateProgram = validateRequest(updProgramSchema);
  const validateCreateProgram = validateRequest(programSchema);

export class ProgramService {
    async getAllPrograms(): Promise<Program[]> {
        try{
            const programs = await prisma.program.findMany();
            return programs;
        } catch (error) {
            throw new Error("Failed to fetch");
        } 
    }

    async getProgramById(id: number): Promise<Program | null> {
        try{
            const program = await prisma.program.findUnique({where: {id}});
            return program;
        } catch (error) {
            throw new Error("Program doesn't exist");
        }
    }
    
    async createProgram(
        data: z.infer<typeof programSchema>
    ): Promise<Program> {
        try{
            const parsedData = await programSchema.parseAsync(data);

            const newProgram = await prisma.program.create({
                data: parsedData
            })
            

            return newProgram;
        } catch (error) {
            console.error("Error creating task:", error);
            throw error;
          }
    }

    

    async updateProgram(
        id: number,
        updates: z.infer<typeof updProgramSchema>
    ): Promise<Program> {
        try{
            const parsedUpdates = await updProgramSchema.parseAsync(updates);

            if (!Object.keys(updates).length) {
                throw new Error("No fields to update");
            }

            const updProgram = await prisma.program.update({where: {id}, data: parsedUpdates});
            return updProgram;
        } catch (error) {
            console.error(error);
            throw new Error("Failed to update program");
        }
    }

    async deleteProgram(id: number): Promise<void> {
        try{
            await prisma.program.delete({where: {id}});
        } catch (error) {
            throw new Error("Failed to delete program");
        }
    }

    async ApplyToProgram(id: number): Promise<void> {
        try{
            await prisma.program.update({where: {id}, data: {
                appliedCount: {increment: 1}
            }})
        } catch (error) {
            throw new Error("Failed to update application count of program");
        }
    }

    async EnrollToProgram(id: number): Promise<void> {
        try{
            await prisma.program.update({where: {id}, data: {
                studentCount: {increment: 1}
            }})
        } catch (error) {
            throw new Error("Failed to update student count of program");
        }
    }
}

export default ProgramService;
export { validateUpdateProgram, validateCreateProgram };