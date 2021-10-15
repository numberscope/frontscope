import { ValidationStatus } from '@/shared/ValidationStatus';
import { SequenceParamsSchema, SequenceExportModule } from './SequenceInterface';
import { SequenceCached } from './SequenceCached';
import * as math from 'mathjs';

/**
 *
 * @class SequenceFormula
 * extends SequenceCached to use mathjs to compute an arbitrary formula in terms
 * of n.
 */
class SequenceFormula extends SequenceCached {
    name = "Formula: empty";
    description = "A sequence defined by a formula in n";
    params: SequenceParamsSchema[] = [new SequenceParamsSchema(
        'formula',
        'text',
        'Formula',
        false,
        'n'
    )];

    private formula: math.EvalFunction;

    /**
     *Creates an instance of SequenceFormula
     * @param {*} ID the ID of the sequence
     */
    constructor (ID: number) {
        super(ID);
        this.formula = math.compile('n'); // tide us over until validate()
    }

    validate(){
        this.settings['name'] = 'Formula';
        const superStatus = super.validate();
        if (!superStatus.isValid) {
            return superStatus;
        }

	this.isValid = false;
        if (this.settings['formula'] === undefined) {
            return new ValidationStatus(false, ["formula  param is missing"]);
        }
        let parsetree = undefined;
        try {
            parsetree = math.parse(this.settings['formula'] as string);
        } catch(err) {
            return new ValidationStatus(
                false, ["Could not parse formula: " + this.settings['formula'],
                        err.message]);
        }
        const othersymbs = parsetree.filter( (node, path, parent) =>
            node.type === 'SymbolNode' && parent.type !== 'FunctionNode'
		&& node.name !== 'n'
        );
	if (othersymbs.length > 0 ) {
            return new ValidationStatus(
                false, ["Only 'n' may occur as a free variable in formula.",
                        "Please remove '"
                            + (othersymbs[0] as math.SymbolNode).name + "'"]);
        }
        this.formula = parsetree.compile();
        this.name = "Formula: " + this.settings['formula'];
        this.isValid = true;
        return new ValidationStatus(true);
    }

    calculate(n: number) {
        return this.formula.evaluate({n: n});
    }

}

export const exportModule = new SequenceExportModule(
    SequenceFormula,
    "Sequence by Formula"
);
