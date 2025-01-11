import {Markup} from 'telegraf';
import {SEPARATOR, STAGES} from './constants';

export const makeButtonValue = <Type extends string | number>(stage: STAGES, payload: Type[] | Type) => {
    const payloadArray = Array.isArray(payload) ? payload : [payload]
    return [stage, ...payloadArray].join(SEPARATOR)
}
export const oneLineButton = (stage: STAGES) => {
    return ({value,label}: {value: string, label: string}) => {
        return Markup.button.callback(label, makeButtonValue(stage, value))
    }
}
