import {Request, Response} from "express";
import ProgramService from "../services/programService";

const programService = new ProgramService();

export const getAllPrograms = async (req: Request, res: Response) => {
    const programs = await programService.getAllPrograms();
    res.json(programs);
}

export const getProgramById = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const program = await programService.getProgramById(id);
    if (!program) {
        res.status(404).json({ message: "Program not found" });
    } else {
        res.json(program);
    }
}

export const createProgram = async (req: Request, res: Response) => {
    const program = req.body;
    try{
        const NewProgram = await programService.createProgram(program);
        res.json(NewProgram);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Error creating program', error });
    }
}

export const updateProgram = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const program = req.body;
    const updProgram = await programService.updateProgram(id, program);
    res.json(updProgram);
}

export const deleteProgram = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    await programService.deleteProgram(id);
    res.json({ message: "Program deleted" });
}

export const ApplyToProgram = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    await programService.ApplyToProgram(id);
    res.json({ message: "Applied to program" });
}

export const EnrollToProgram = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    await programService.EnrollToProgram(id);
    res.json({ message: "Enrolled into program" });
}