import { ValidationStatus } from '@/shared/ValidationStatus';
import { SequenceParamsSchema, SequenceExportModule,
         SequenceExportKind } from './SequenceInterface';
import { SequenceCached } from './SequenceCached';

/**
 *
 * @class SequenceClassRandom
 * Creates a sequence of random integers in a specified range.
 *
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
		this.name = "Random integers " + String(Number(this.settings.min)) + " to " + String(Number(this.settings.max));

		return new ValidationStatus(true);

	}

	calculate(n: number) {
		this.minimum = Number(this.settings.min);
		this.maximum = Number(this.settings.max);

		// create a random integer between min and max inclusive
		return Math.floor((Math.random() * (this.maximum - this.minimum + 1)) + this.minimum);
	}

}

export const exportModule = new SequenceExportModule(
	SequenceRandom,
	"Random Integers in Range",
	SequenceExportKind.FAMILY
);
