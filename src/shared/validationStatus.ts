export class ValidationStatus {
    public isValid: boolean;
    public errors: string[];

    constructor(isValid: boolean, errors?: string[]){
        this.isValid = isValid;
        this.errors = errors !== undefined ? errors : [];
    }
}
