/* tslint:disable */
/* eslint-disable */
/**
 * REST api to TON blockchain explorer
 * Provide access to indexed TON blockchain
 *
 * The version of the OpenAPI document: 2.0.0
 * Contact: support@tonkeeper.com
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

import { exists, mapValues } from '../runtime';
import type { AccountAddress } from './AccountAddress';
import {
    AccountAddressFromJSON,
    AccountAddressFromJSONTyped,
    AccountAddressToJSON,
} from './AccountAddress';

/**
 * 
 * @export
 * @interface Fee
 */
export interface Fee {
    /**
     * 
     * @type {AccountAddress}
     * @memberof Fee
     */
    account: AccountAddress;
    /**
     * gas + rent + deposit - refund
     * @type {number}
     * @memberof Fee
     */
    total: number;
    /**
     * 
     * @type {number}
     * @memberof Fee
     */
    gas: number;
    /**
     * 
     * @type {number}
     * @memberof Fee
     */
    rent: number;
    /**
     * 
     * @type {number}
     * @memberof Fee
     */
    deposit: number;
    /**
     * 
     * @type {number}
     * @memberof Fee
     */
    refund: number;
}

/**
 * Check if a given object implements the Fee interface.
 */
export function instanceOfFee(value: object): boolean {
    let isInstance = true;
    isInstance = isInstance && "account" in value;
    isInstance = isInstance && "total" in value;
    isInstance = isInstance && "gas" in value;
    isInstance = isInstance && "rent" in value;
    isInstance = isInstance && "deposit" in value;
    isInstance = isInstance && "refund" in value;

    return isInstance;
}

export function FeeFromJSON(json: any): Fee {
    return FeeFromJSONTyped(json, false);
}

export function FeeFromJSONTyped(json: any, ignoreDiscriminator: boolean): Fee {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'account': AccountAddressFromJSON(json['account']),
        'total': json['total'],
        'gas': json['gas'],
        'rent': json['rent'],
        'deposit': json['deposit'],
        'refund': json['refund'],
    };
}

export function FeeToJSON(value?: Fee | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'account': AccountAddressToJSON(value.account),
        'total': value.total,
        'gas': value.gas,
        'rent': value.rent,
        'deposit': value.deposit,
        'refund': value.refund,
    };
}

