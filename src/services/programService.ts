import { PrismaClient } from '@prisma/client';
import { Program } from '@prisma/client';
import { DateUtil } from '../utils/dateUtil';

const prisma = new PrismaClient();

export class ProgramService {
    private dateUtil: DateUtil;

    constructor(dateUtil: DateUtil) {
        this.dateUtil = dateUtil;
    }

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
        title: string,
        description: string,
        founder: string,
        durationInDays: number,
        applicationDeadline: Date
    ): Promise<Program> {
        try{
            if (!title.trim()) {
                throw new Error("Title cannot be empty or whitespace only");
            }

            const parsedDate = typeof applicationDeadline === 'string' ? new Date(applicationDeadline) : applicationDeadline;
            
            if(!this.dateUtil.validateDate(parsedDate)) {
                console.log(parsedDate);
                throw new Error("Invalid due date: must be a valid date");
            }

            const newProgram = await prisma.program.create({
                data: {
                    title,
                    description,
                    founder,
                    durationInDays,
                    applicationDeadline: parsedDate
                }
            })

            return newProgram;
        } catch (error) {
            console.error("Error creating task:", error);
            throw error;
          }
    }

    async updateProgram(
        id: number,
        updates: Partial<{
            title: string;
            description: string;
            founder: string;
            durationInDays: number;
            applicationDeadline: Date;
        }>
    ): Promise<Program> {
        try{
            const parsedDate = typeof updates.applicationDeadline === 'string' ? new Date(updates.applicationDeadline) : updates.applicationDeadline;
            if(!this.dateUtil.validateDate(parsedDate)) {
                throw new Error("Invalid due date: must be a valid date");
            }
            updates.applicationDeadline = parsedDate;
            const updProgram = await prisma.program.update({where: {id}, data: updates});

            if(!updates.title && !updates.description && !updates.founder && !updates.durationInDays && !updates.applicationDeadline) {
                throw new Error("No fields to update");
            }
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

    async AppliedToProgram(id: number): Promise<void> {
        try{
            await prisma.program.update({where: {id}, data: {
                appliedCount: {increment: 1}
            }})
        } catch (error) {
            throw new Error("Failed to update application count of program");
        }
    }

    async AcceptedToProgram(id: number): Promise<void> {
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