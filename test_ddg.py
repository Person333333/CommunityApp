try:
    from duckduckgo_search import DDGS
    with DDGS() as ddgs:
        results = ddgs.text("ADWAS Shelter Seattle phone number", max_results=2)
    print(results)
except Exception as e:
    print("Error:", e)
