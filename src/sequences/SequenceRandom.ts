import { ValidationStatus } from '@/shared/ValidationStatus';
import { SequenceParamsSchema, SequenceExportModule,
         SequenceExportKind } from './SequenceInterface';
import { SequenceCached } from './SequenceCached';

/**
 *
 * @class SequenceClassNaturals
 * extends SequenceCached with a very simple calculate, mostly by way of an
 * example of using SequenceCached.
 */
class SequenceRandom extends SequenceCached {
    name = "Random Integers in Range";
    description = "A sequence of integers chosen indepenently uniformly from n to m inclusive.";
    params: SequenceParamsSchema[] = [new SequenceParamsSchema(
        'min',
        'number',
        'Minimum value attainable',
        false,
        0 
    ),
    new SequenceParamsSchema(
        'max',
        'number',
        'Maximum value attainable',
        false,
        9
    )];

    private minimum = 0;
    private maximum = 0;
    private servedTerms: number[] = [];

    /**
     *Creates an instance of SequenceRandom
     * @param {*} ID the ID of the sequence
     */
    constructor (ID: number) {
        super(ID);
    }

    validate(){
        this.settings['name'] = 'Constant';
        const superStatus = super.validate();
        if (!superStatus.isValid) {
            return superStatus;
        }

	if (this.settings['min'] == undefined || this.settings['max'] == undefined ) {
		this.isValid = false;
		return new ValidationStatus(false, ["The min or max parameter is missing."]);
	}

	if ( !Number.isInteger( Number(this.settings.min) ) ) return new ValidationStatus(false, ["The min value must be an integer."]);
	if ( !Number.isInteger( Number(this.settings.max) ) ) return new ValidationStatus(false, ["The max value must be an integer."]);

	this.isValid = true;
	this.name = "Random integers from " + String(Number(this.settings.min)) + " to " + String(Number(this.settings.max));

	return new ValidationStatus(true);

    }

    calculate(n: number) {
	this.minimum = Number(this.settings.min);
	this.maximum = Number(this.settings.max);

	console.log( "term", this.servedTerms[n] );
	if ( isNaN(this.servedTerms[n])  ) {
		const myVal = Math.floor((Math.random() * (this.maximum - this.minimum + 1)) + this.minimum);
		console.log( "myVal", myVal, Math.random() );
		this.servedTerms[n] = myVal;
	}
	return this.servedTerms[n];
    }

}

export const exportModule = new SequenceExportModule(
    SequenceRandom,
    "Random Integers in Range",
    SequenceExportKind.FAMILY
);
