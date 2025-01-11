import {Option} from '@prisma/client';
import {api} from './api';

export class OptionsService {
    options: Option[] = []

    constructor() {
        this.initOptions();
    }

    private initOptions() {
        api.get<Option[]>('/options').then(res => {
            return this.options.push(...res.data);
        })
    }

    getOptions() {
        return this.options;
    }

    static createInvertedPyramid(arr: Option[]) {
        const result: Option[][] = []

        let row: Option[] = []
        let lineSize = 1
        while(arr.length>0) {
            const button = arr.pop()
            if (!button) continue

            row.unshift(button)

            if (row.length === lineSize) {
                result.unshift(row)
                row = []
                lineSize++
            }
        }
        if (row.length>0) result.unshift(row)
        return result;
    }
}

export default new OptionsService();
