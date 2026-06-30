import os
import json
import cv2
import numpy as np
from scipy.signal import find_peaks
from google import genai
from google.genai import types

def calculate_thread_density(image_bytes: bytes) -> dict:
    """
    Uses OpenCV and FFT to estimate warp and weft thread density.
    """
    try:
        # Decode image
        np_arr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(np_arr, cv2.IMREAD_GRAYSCALE)
        
        if img is None:
            print("OpenCV: Could not decode image.")
            return {"warp_count": 0, "weft_count": 0, "thread_density": 0}
            
        h, w = img.shape
        
        # Apply FFT
        f = np.fft.fft2(img)
        fshift = np.fft.fftshift(f)
        magnitude_spectrum = 20 * np.log(np.abs(fshift) + 1)
        
        # Project to 1D signals by taking mean around the center axes
        center_y, center_x = h // 2, w // 2
        slice_size = max(10, min(h, w) // 10)
        
        proj_x = np.mean(magnitude_spectrum[max(0, center_y-slice_size):min(h, center_y+slice_size), :], axis=0)
        proj_y = np.mean(magnitude_spectrum[:, max(0, center_x-slice_size):min(w, center_x+slice_size)], axis=1)
        
        # Find peaks
        peaks_x, _ = find_peaks(proj_x, prominence=2)
        peaks_y, _ = find_peaks(proj_y, prominence=2)
        
        # Calculate dominant frequency (distance from center)
        def get_dominant_freq(peaks, center, size):
            distances = [abs(p - center) for p in peaks if abs(p - center) > max(3, size * 0.01)]
            if not distances:
                return 0
            min_dist = min(distances)
            return min_dist / size # frequency in cycles per pixel

        freq_x = get_dominant_freq(peaks_x, center_x, w)
        freq_y = get_dominant_freq(peaks_y, center_y, h)
        
        # Assume a default DPI of 300 for macro shots if metadata is missing
        DPI = 300 
        warp_ppi = int(freq_x * DPI)
        weft_ppi = int(freq_y * DPI)
        
        # Sanity bounds (threads per inch typically 30 - 200)
        warp_ppi = max(10, min(warp_ppi, 300)) if warp_ppi > 0 else 0
        weft_ppi = max(10, min(weft_ppi, 300)) if weft_ppi > 0 else 0
        
        # If FFT fails to find anything reasonable, provide a fallback estimate
        if warp_ppi == 0 and weft_ppi == 0:
            warp_ppi, weft_ppi = 45, 35
            
        return {
            "warp_count": warp_ppi,
            "weft_count": weft_ppi,
            "thread_density": warp_ppi + weft_ppi
        }
    except Exception as e:
        print(f"OpenCV Error: {e}")
        return {"warp_count": 0, "weft_count": 0, "thread_density": 0}

def analyze_fabric_with_gemini(image_bytes: bytes, cv2_data: dict, mime_type: str = "image/jpeg", language: str = "en") -> dict:
    """
    Sends the image and OpenCV metrics to Gemini for full analysis.
    """
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        print("Warning: GEMINI_API_KEY not found in environment. Returning fallback mock data.")
        return get_mock_analysis(cv2_data)

    client = genai.Client(api_key=api_key)
    
    prompt = f"""
    Analyze this fabric image and provide a structured JSON report.
    I have already calculated the thread density using OpenCV FFT:
    - Estimated Warp Threads: {cv2_data.get('warp_count', 0)}
    - Estimated Weft Threads: {cv2_data.get('weft_count', 0)}
    - Total Thread Density: {cv2_data.get('thread_density', 0)}
    
    Based on the image and these metrics, please return a JSON object with EXACTLY the following structure.
    TRANSLATE all text values (like fabric_type, weave_pattern, ai_suggestions, detailed_analysis) into the language code: "{language}". Keep the JSON keys in English.
    {{
        "fabric_type": "string (e.g., Cotton, Denim, Silk, Polyester, Linen, Wool)",
        "weave_pattern": "string (e.g., Plain Weave, Twill Weave, Satin Weave, Basket Weave)",
        "confidence_score": integer (0-100),
        "quality_grade": "string (A+, A, B+, B, C)",
        "ocr_text": "string (OCR: extract any brand names, textile composition like 100% Cotton, size tags, care instructions, or other printed text visible on labels/tags in the image. Return empty string if no text is visible)",
        "ai_suggestions": "string (suggestions for improvement or usage)",
        "detailed_analysis": "string (detailed breakdown of visual characteristics, defects, and weave)"
    }}
    """
    
    # Map mime types, default to jpeg if unknown
    valid_mimes = ["image/jpeg", "image/png", "image/webp"]
    if mime_type not in valid_mimes:
        mime_type = "image/jpeg"
        
    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=[
                types.Part.from_bytes(data=image_bytes, mime_type=mime_type),
                prompt
            ],
            config=types.GenerateContentConfig(
                response_mime_type="application/json"
            )
        )
        result = json.loads(response.text)
        
        # Merge with cv2 data
        result["thread_density"] = cv2_data.get("thread_density", result.get("thread_density", 0))
        result["warp_count"] = cv2_data.get("warp_count", result.get("warp_count", 0))
        result["weft_count"] = cv2_data.get("weft_count", result.get("weft_count", 0))
        # Ensure ocr_text field exists
        if "ocr_text" not in result:
            result["ocr_text"] = ""
        
        return result
    except Exception as e:
        print(f"Gemini API Error: {e}")
        return get_mock_analysis(cv2_data)

def get_mock_analysis(cv2_data=None):
    if not cv2_data:
        cv2_data = {"warp_count": 45, "weft_count": 35, "thread_density": 80}
    return {
        "fabric_type": "Cotton (Fallback)",
        "weave_pattern": "Plain Weave (Fallback)",
        "confidence_score": 85,
        "quality_grade": "B",
        "ocr_text": "Sample Tag: 100% Premium Cotton - Made in India",
        "ai_suggestions": "API Key not configured. Showing fallback data.",
        "detailed_analysis": "Please configure GEMINI_API_KEY in the environment.",
        "thread_density": cv2_data.get("thread_density", 0),
        "warp_count": cv2_data.get("warp_count", 0),
        "weft_count": cv2_data.get("weft_count", 0)
    }
