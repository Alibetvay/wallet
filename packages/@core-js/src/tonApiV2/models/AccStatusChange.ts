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


/**
 * 
 * @export
 */
export const AccStatusChange = {
    Unchanged: 'acst_unchanged',
    Frozen: 'acst_frozen',
    Deleted: 'acst_deleted'
} as const;
export type AccStatusChange = typeof AccStatusChange[keyof typeof AccStatusChange];


export function AccStatusChangeFromJSON(json: any): AccStatusChange {
    return AccStatusChangeFromJSONTyped(json, false);
}

export function AccStatusChangeFromJSONTyped(json: any, ignoreDiscriminator: boolean): AccStatusChange {
    return json as AccStatusChange;
}

export function AccStatusChangeToJSON(value?: AccStatusChange | null): any {
    return value as any;
}

