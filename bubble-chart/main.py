# main.py
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from utils.graph_builder import build_summary, get_subgraph
import uvicorn

app = FastAPI(title="Saksham Graph API")

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True, allow_methods=["*"], allow_headers=["*"], allow_origins=["*"]
)

@app.get("/api/graph/summary")
def api_graph_summary(force: bool = Query(False, description="Force rebuild of cached summary")):
    """
    Returns the full graph summary (nodes + links + meta).
    Set ?force=true to recompute from CSVs and refresh cache.
    """
    payload = build_summary(force_recompute=force)
    return payload

@app.get("/api/company/{company_id}")
def company_detail(company_id: str):
    """
    Return a focused subgraph and a detail summary for the given company_id.
    """
    # subgraph depth 1 by default
    sub = get_subgraph(company_id, depth=1)
    if not sub["nodes"]:
        raise HTTPException(status_code=404, detail="Company not found or no related nodes")
    # pick the node summary for company
    company_node = next((n for n in sub["nodes"] if n["id"] == company_id and n["type"] == "company"), None)
    return {"node": company_node, "subgraph": sub}

@app.get("/api/freelancer/{user_id}")
def freelancer_detail(user_id: str):
    sub = get_subgraph(user_id, depth=1)
    if not sub["nodes"]:
        raise HTTPException(status_code=404, detail="Freelancer not found or no related nodes")
    freelancer_node = next((n for n in sub["nodes"] if n["id"] == user_id and n["type"] == "freelancer"), None)
    return {"node": freelancer_node, "subgraph": sub}

@app.get("/api/graph/subgraph")
def api_subgraph(center: str = Query(...), depth: int = Query(1, ge=1, le=4)):
    sub = get_subgraph(center, depth=depth)
    return sub

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
