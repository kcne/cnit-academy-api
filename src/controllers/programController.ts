import {Request, Response} from "express";
import ProgramService from "../services/programService";
import { DateUtil } from "../utils/dateUtil";

const dateUtil = new DateUtil();
const programService = new ProgramService(dateUtil);

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
    const {title, description, founder, durationInDays, applicationDeadline} = req.body;
    if(!title || !description || !founder || !durationInDays || !applicationDeadline) {
        res.status(400).json({ message: 'Missing input fields' });
        return;
    }

    console.log(title, description, founder, durationInDays, applicationDeadline);

    try{
        const program = await programService.createProgram(title, description, founder, durationInDays, applicationDeadline);
        res.json(program);
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

export const AppliedToProgram = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    await programService.AppliedToProgram(id);
    res.json({ message: "Applied to program successfully" });
}

export const AcceptedToProgram = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    await programService.AcceptedToProgram(id);
    res.json({ message: "Accepted to program successfully" });
}