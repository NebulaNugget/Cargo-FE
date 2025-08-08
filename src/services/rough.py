# Add this new endpoint after the existing endpoints
@router.get("/{task_id}/screenshots")
async def get_task_screenshots(
    task_id: str,
    db=Depends(get_db)
):
    """Get all PNG screenshots for a specific task"""
    # Verify task exists
    task_repo = TaskRepository(db)
    task = await task_repo.get_task(task_id)
    
    if not task:
        raise HTTPException(404, "Task not found")
    
    # Define screenshot directory path
    screenshot_base_dir = Path("C:/Users/UK-PC/Desktop/AI driven cargo-wise automation framework/cargowise-ai-backend/screenshots")
    task_screenshot_dir = screenshot_base_dir / task_id
    
    # Check if task screenshot directory exists
    if not task_screenshot_dir.exists():
        return {
            "task_id": task_id,
            "screenshots": [],
            "message": "No screenshots found for this task"
        }
    
    # Get all PNG files in the task directory
    png_files = list(task_screenshot_dir.glob("*.png"))
    
    if not png_files:
        return {
            "task_id": task_id,
            "screenshots": [],
            "message": "No PNG files found for this task"
        }
    
    # Sort by creation time (newest first)
    png_files.sort(key=lambda f: f.stat().st_mtime, reverse=True)
    
    # Prepare response with file information
    screenshots = []
    for png_file in png_files:
        screenshots.append({
            "filename": png_file.name,
            "path": str(png_file),
            "size_bytes": png_file.stat().st_size,
            "created_at": datetime.fromtimestamp(png_file.stat().st_mtime).isoformat(),
            "download_url": f"/api/v1/tasks/{task_id}/screenshots/{png_file.name}"
        })
    
    return {
        "task_id": task_id,
        "screenshots": screenshots,
        "total_count": len(screenshots)
    }

@router.get("/{task_id}/screenshots/{filename}")
async def download_task_screenshot(
    task_id: str,
    filename: str,
    db=Depends(get_db)
):
    """Download a specific PNG screenshot for a task"""
    # Verify task exists
    task_repo = TaskRepository(db)
    task = await task_repo.get_task(task_id)
    
    if not task:
        raise HTTPException(404, "Task not found")
    
    # Define screenshot directory path
    screenshot_base_dir = Path("C:/Users/UK-PC/Desktop/AI driven cargo-wise automation framework/cargowise-ai-backend/screenshots")
    task_screenshot_dir = screenshot_base_dir / task_id
    
    # Construct full file path
    file_path = task_screenshot_dir / filename
    
    # Security check: ensure the file is within the task directory
    try:
        file_path = file_path.resolve()
        task_screenshot_dir = task_screenshot_dir.resolve()
        if not str(file_path).startswith(str(task_screenshot_dir)):
            raise HTTPException(403, "Access denied")
    except Exception:
        raise HTTPException(403, "Invalid file path")
    
    # Check if file exists and is a PNG
    if not file_path.exists():
        raise HTTPException(404, "Screenshot not found")
    
    if not file_path.suffix.lower() == '.png':
        raise HTTPException(400, "Only PNG files are supported")
    
    # Return the file
    return FileResponse(
        path=str(file_path),
        media_type="image/png",
        filename=filename
    )