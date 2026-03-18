import pandas as pd
import glob

csv_files = glob.glob('datasets/*.csv')
for f in csv_files:
    print(f"\n--- {f} ---")
    try:
        df = pd.read_csv(f, nrows=0)
        print("Columns:", list(df.columns))
    except Exception as e:
        print("Error:", e)
