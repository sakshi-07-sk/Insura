"""Dataset Download Helper for Vehicle Insurance Claim Fraud Detection.

Supports automated download from open mirror or guided manual download from Kaggle.
Dataset: Vehicle Insurance Claim Fraud Detection (Kaggle: shivamb/vehicle-claim-fraud-detection).
"""

import argparse
import os
import sys
import urllib.request

DATA_URL = "https://raw.githubusercontent.com/Wkimani/Auto-Insurance-Fraud-Detection-Using-ML/main/fraud_oracle.csv"
DEFAULT_DEST = "data/raw/claims.csv"


def download_dataset(dest_path: str = DEFAULT_DEST, force: bool = False) -> None:
    """Downloads the benchmark insurance claim dataset if not already present."""
    os.makedirs(os.path.dirname(dest_path) or ".", exist_ok=True)

    if os.path.exists(dest_path) and not force:
        print(f"[INFO] Dataset already exists at: {dest_path}")
        print("Use --force to re-download.")
        return

    print(f"[*] Downloading dataset to: {dest_path}...")
    try:
        urllib.request.urlretrieve(DATA_URL, dest_path)
        print(f"[SUCCESS] Download completed. File size: {os.path.getsize(dest_path):,} bytes.")
    except Exception as e:
        print(f"[ERROR] Failed to download dataset: {e}", file=sys.stderr)
        print("\nManual Download Instructions:")
        print("1. Visit: https://www.kaggle.com/datasets/shivamb/vehicle-claim-fraud-detection")
        print("2. Download 'fraud_oracle.csv'.")
        print(f"3. Place the downloaded file at '{dest_path}'.")
        sys.exit(1)


def main():
    parser = argparse.ArgumentParser(description="Download insurance fraud dataset.")
    parser.add_argument("--dest", type=str, default=DEFAULT_DEST, help="Destination CSV path")
    parser.add_argument("--force", action="store_true", help="Force overwrite existing file")
    args = parser.parse_args()

    download_dataset(dest_path=args.dest, force=args.force)


if __name__ == "__main__":
    main()
