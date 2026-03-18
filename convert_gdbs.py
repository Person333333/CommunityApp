import os
import glob
import geopandas as gpd

def convert_gdb_to_csv(gdb_path):
    print(f"Loading {gdb_path}...")
    try:
        # A file geodatabase can have multiple layers. Let's list them.
        import fiona
        layers = fiona.listlayers(gdb_path)
        print(f"Layers in {gdb_path}: {layers}")
        
        for layer in layers:
            gdf = gpd.read_file(gdb_path, layer=layer)
            
            # Reproject to WGS84 (EPSG:4326) to get standard latitude/longitude
            if gdf.crs and gdf.crs.to_epsg() != 4326:
                print(f"Reprojecting from {gdf.crs} to EPSG:4326")
                gdf = gdf.to_crs(epsg=4326)
            
            # Extract coordinates
            if 'geometry' in gdf.columns:
                gdf['longitude'] = gdf.geometry.x
                gdf['latitude'] = gdf.geometry.y
                # Drop geometry column to save as regular CSV
                gdf = gdf.drop(columns=['geometry'])
            
            # Generate output filename
            base_name = os.path.basename(gdb_path).replace('.gdb', '')
            out_file = f"datasets/{base_name}_{layer}.csv"
            
            gdf.to_csv(out_file, index=False)
            print(f"Saved {layer} to {out_file}")
            
    except Exception as e:
        print(f"Error converting {gdb_path}: {e}")

if __name__ == '__main__':
    gdb_folders = glob.glob('datasets/*.gdb')
    if not gdb_folders:
        print("No .gdb folders found in datasets/")
    for gdb in gdb_folders:
        convert_gdb_to_csv(gdb)
