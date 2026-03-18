const gdal = require('gdal-async');
const fs = require('fs');
const path = require('path');

const gdbFolders = [
    'datasets/Hospitals.gdb',
    'datasets/pharmacies.gdb',
    'datasets/wic_clinics.gdb'
];

async function convertGdbToCsv(gdbPath) {
    console.log(`Loading ${gdbPath}...`);
    try {
        const dataset = await gdal.openAsync(gdbPath);
        const layers = dataset.layers.map(l => l.name);
        console.log(`Layers in ${gdbPath}:`, layers);

        for (const layerName of layers) {
            const layer = dataset.layers.get(layerName);
            const features = layer.features;
            
            const records = [];
            // Assuming WGS84 for GeoJSON transformation
            const wgs84 = gdal.SpatialReference.fromEPSG(4326);
            let transform = null;
            if (layer.srs && !layer.srs.isSame(wgs84)) {
                transform = new gdal.CoordinateTransformation(layer.srs, wgs84);
            }

            let feature = features.first();
            while (feature) {
                const fields = feature.fields.toObject();
                // Get geometry
                let geom = feature.getGeometry();
                if (geom && transform) {
                    geom.transform(transform);
                }
                if (geom && geom.name === 'POINT') {
                    fields['longitude'] = geom.x;
                    fields['latitude'] = geom.y;
                }
                records.push(fields);
                feature = features.next();
            }

            if (records.length === 0) continue;

            // Get columns and write CSV
            const headers = Object.keys(records[0]);
            const headerLine = headers.join(',') + '\n';
            const lines = records.map(rec => {
                return headers.map(h => {
                    let val = rec[h];
                    if (val === null || val === undefined) return '';
                    if (typeof val === 'string') return `"${val.replace(/"/g, '""')}"`;
                    return val;
                }).join(',');
            }).join('\n');

            const baseName = path.basename(gdbPath, '.gdb');
            const outPath = `datasets/${baseName}_${layerName}.csv`;
            fs.writeFileSync(outPath, headerLine + lines);
            console.log(`Saved ${layerName} to ${outPath}`);
        }
    } catch (e) {
        console.error(`Error processing ${gdbPath}:`, e);
    }
}

async function main() {
    for (const gdb of gdbFolders) {
        if (fs.existsSync(gdb)) {
            await convertGdbToCsv(gdb);
        } else {
            console.log(`Not found: ${gdb}`);
        }
    }
}

main().catch(console.error);
