/* tslint:disable */
/* eslint-disable */
/**
 * REST api to TON blockchain explorer
 * Provide access to indexed TON blockchain
 *
 * The version of the OpenAPI document: 0.0.1
 * Contact: contact@fslabs.org
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */


import * as runtime from '../runtime';
import type {
  FuncAnalyzeOK,
} from '../models';
import {
    FuncAnalyzeOKFromJSON,
    FuncAnalyzeOKToJSON,
} from '../models';

export interface GetFuncAnalyzeInfoRequest {
    id: string;
}

/**
 * FuncAnalyzerApi - interface
 * 
 * @export
 * @interface FuncAnalyzerApiInterface
 */
export interface FuncAnalyzerApiInterface {
    /**
     * Get info from analyzer
     * @param {string} id Code ID
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof FuncAnalyzerApiInterface
     */
    getFuncAnalyzeInfoRaw(requestParameters: GetFuncAnalyzeInfoRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<FuncAnalyzeOK>>;

    /**
     * Get info from analyzer
     */
    getFuncAnalyzeInfo(requestParameters: GetFuncAnalyzeInfoRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<FuncAnalyzeOK>;

    /**
     * Analyze func code
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof FuncAnalyzerApiInterface
     */
    putFuncFilesRaw(initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<FuncAnalyzeOK>>;

    /**
     * Analyze func code
     */
    putFuncFiles(initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<FuncAnalyzeOK>;

}

/**
 * 
 */
export class FuncAnalyzerApi extends runtime.BaseAPI implements FuncAnalyzerApiInterface {

    /**
     * Get info from analyzer
     */
    async getFuncAnalyzeInfoRaw(requestParameters: GetFuncAnalyzeInfoRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<FuncAnalyzeOK>> {
        if (requestParameters.id === null || requestParameters.id === undefined) {
            throw new runtime.RequiredError('id','Required parameter requestParameters.id was null or undefined when calling getFuncAnalyzeInfo.');
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = await token("JWTAuth", []);

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }
        const response = await this.request({
            path: `/v1/compile/info/{id}`.replace(`{${"id"}}`, encodeURIComponent(String(requestParameters.id))),
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => FuncAnalyzeOKFromJSON(jsonValue));
    }

    /**
     * Get info from analyzer
     */
    async getFuncAnalyzeInfo(requestParameters: GetFuncAnalyzeInfoRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<FuncAnalyzeOK> {
        const response = await this.getFuncAnalyzeInfoRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * Analyze func code
     */
    async putFuncFilesRaw(initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<FuncAnalyzeOK>> {
        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = await token("JWTAuth", []);

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }
        const response = await this.request({
            path: `/v1/func/compile`,
            method: 'POST',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => FuncAnalyzeOKFromJSON(jsonValue));
    }

    /**
     * Analyze func code
     */
    async putFuncFiles(initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<FuncAnalyzeOK> {
        const response = await this.putFuncFilesRaw(initOverrides);
        return await response.value();
    }

}