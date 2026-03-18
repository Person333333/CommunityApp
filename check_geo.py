try:
    import geopandas as gpd
    print("geopandas available")
except ImportError:
    print("geopandas missing")

try:
    import fiona
    print("fiona available")
    print("Fiona supported drivers:", fiona.supported_drivers)
except ImportError:
    print("fiona missing")

