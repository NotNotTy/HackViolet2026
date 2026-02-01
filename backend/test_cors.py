#!/usr/bin/env python3
"""
Quick test script to verify CORS is working
Run this while the main server is running to test CORS
"""
import requests
import json

# Test the register endpoint with CORS headers
url = "http://localhost:5001/api/register"
headers = {
    "Content-Type": "application/json",
    "Origin": "http://localhost:5173"
}

data = {
    "username": "testuser",
    "password": "testpass",
    "first_name": "Test",
    "last_name": "User",
    "email": "test@test.edu"
}

try:
    # First test OPTIONS preflight
    print("Testing OPTIONS preflight request...")
    options_response = requests.options(url, headers=headers)
    print(f"OPTIONS Status: {options_response.status_code}")
    print(f"CORS Headers in OPTIONS:")
    for header in ['Access-Control-Allow-Origin', 'Access-Control-Allow-Methods', 'Access-Control-Allow-Headers']:
        print(f"  {header}: {options_response.headers.get(header, 'NOT FOUND')}")
    
    # Then test actual POST
    print("\nTesting POST request...")
    post_response = requests.post(url, headers=headers, json=data)
    print(f"POST Status: {post_response.status_code}")
    print(f"CORS Headers in POST:")
    for header in ['Access-Control-Allow-Origin', 'Access-Control-Allow-Methods', 'Access-Control-Allow-Headers']:
        print(f"  {header}: {post_response.headers.get(header, 'NOT FOUND')}")
    
    print(f"\nResponse: {post_response.text}")
    
except requests.exceptions.ConnectionError:
    print("ERROR: Could not connect to backend. Is the server running on http://localhost:5001?")
except Exception as e:
    print(f"ERROR: {e}")
