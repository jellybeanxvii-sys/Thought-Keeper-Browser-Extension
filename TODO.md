# Thought Keeper Vault UI Improvement - TODO

## Plan Summary
- **Goal**: Fix detached result cards in vault by using preview cards + "See more" modals for full details.
- **Files**: popup.js (main logic), popup.css (styles), popup.html (optional modal template).
- **Key Features**:
  1. Preview cards: Truncated original + preview indicators + "See more" button.
  2. Detail modal: Centered/resizable, structured full content (Original → Translate → ELI5 → Note → Meta).
  3. Consistent glassmorphism design.

## Steps (Track Progress: ✅ / ❌)

✅ **Step 1**: Create TODO.md (this file)  
❌ **Step 2**: Update popup.css - Add styles for .thought-preview, .see-more-btn, .detail-modal-overlay, .detail-modal, structured content sections (.full-original, .full-translate, etc.).  
❌ **Step 3**: Update popup.js - Refactor createThoughtElement() to preview-only + add seeMoreBtn listener calling openDetailModal(thought).  
❌ **Step 4**: Implement openDetailModal(thought) in popup.js - Create centered modal HTML (from template/JS), populate with full structured data, add close/drag/resize (reuse content.js patterns), position/animate.  
❌ **Step 5**: Update renderThoughts() / edit mode to work with new preview structure.  
❌ **Step 6**: Test: Add entry with translate+ELI5 via content popup → verify preview clean, modal shows ordered full content neatly.  
❌ **Step 7**: Minor polish - Add copy buttons in modal, responsive tweaks.  
✅ **Step 8**: Complete & cleanup TODO.md  

**Next**: Step 2 - CSS updates.
