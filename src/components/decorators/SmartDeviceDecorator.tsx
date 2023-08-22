import { QueryRowFormat } from '@itwin/core-common';
import { Decorator, IModelConnection, ScreenViewport, Marker, DecorateContext } from '@itwin/core-frontend'

import { SmartDeviceMarker } from '../markers/SmartDeviceMarker';
export class SmartDeviceDecorator implements Decorator {

    private _iModel: IModelConnection;
    private _markerSet: Marker[];

    constructor(vp: ScreenViewport) {
        this._iModel = vp.iModel;
        this._markerSet = [];

        this.addMarkers();
    }

    private async getSmartDeviceData() {

        const query = `
        SELECT SmartDeviceId, SmartDeviceType,Origin 
        FROM DgnCustomItemTypes_HouseSchema.SmartDevice
        WHERE Origin IS NOT NULL
            
        `
        const results = this._iModel.query(query, undefined, { rowFormat: QueryRowFormat.UseJsPropertyNames })

        const values: any[] = [];

        for await (const row of results)
            values.push(row)
    }

    private async addMarkers() {
        const values: any = await this.getSmartDeviceData()
        values.forEach((value: { origin: { x: any; y: any; z: any; }; smartDeviceId: string; smartDeviceType: string}) => {
            const smartDevicemarker = new SmartDeviceMarker(
                { x: value.origin.x, y: value.origin.y, z: value.origin.z },
                { x: 40, y: 40 },
                value.smartDeviceId,
                value.smartDeviceType);

            const htmlElement = document.createElement('div');


            htmlElement.innerHTML = `<h3>${value.smartDeviceId}</h3>`

            smartDevicemarker.htmlElement = htmlElement;

            this._markerSet.push(smartDevicemarker);
        });
    }

    public decorate(context: DecorateContext): void {
        this._markerSet.forEach(marker => {
            marker.addDecoration(context);
        })
    }
}