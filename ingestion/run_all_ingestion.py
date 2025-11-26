"""
Master Data Ingestion Script

Runs all available data ingestion scripts in sequence.
"""

import sys
import os

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def run_script(script_name: str, description: str):
    """Run an ingestion script"""
    print(f"\n{'='*60}")
    print(f"🚀 Running: {description}")
    print(f"{'='*60}\n")
    
    try:
        if script_name == "mock":
            from ingestion import mock_data_ingestion
            mock_data_ingestion.run_ingestion(days=30)
        elif script_name == "openmeteo":
            from ingestion import openmeteo_ingestion
            openmeteo_ingestion.run_ingestion()
        elif script_name == "openaq":
            from ingestion import openaq_ingestion
            openaq_ingestion.run_ingestion()
        
        print(f"\n✅ {description} completed successfully!")
        return True
    
    except Exception as e:
        print(f"\n❌ {description} failed: {e}")
        return False


def main():
    """Run all ingestion scripts"""
    print("🌍 EcoTrack Data Ingestion Pipeline")
    print("=" * 60)
    
    results = {}
    
    # Run Open-Meteo (no API key needed - always works!)
    results["Open-Meteo"] = run_script("openmeteo", "Open-Meteo Weather Data")
    
    # Run OpenAQ (if API key is set)
    openaq_key = os.getenv("OPENAQ_API_KEY")
    if openaq_key and openaq_key != "YOUR_API_KEY_HERE":
        results["OpenAQ"] = run_script("openaq", "OpenAQ Air Quality Data")
    else:
        print("\n⚠️  Skipping OpenAQ (API key not set)")
        print("   Set OPENAQ_API_KEY environment variable to enable")
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 INGESTION SUMMARY")
    print("=" * 60)
    
    for source, success in results.items():
        status = "✅ SUCCESS" if success else "❌ FAILED"
        print(f"{source:20s} {status}")
    
    print("\n✅ Data ingestion pipeline completed!")


if __name__ == "__main__":
    main()
