export interface dateUtil {
    validateDate(date: Date): boolean
}

export class DateUtil implements dateUtil {
    validateDate(date: any): boolean {
        const now = new Date();
        const parsedDate = new Date(date); 
        return parsedDate instanceof Date && !isNaN(parsedDate.getTime()) && parsedDate >= now;
    }
}