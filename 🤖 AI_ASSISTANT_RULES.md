# 🤖 AI ASSISTANT RULES - MANDATORY WORKFLOW
**Version:** 1.0.0  
**Created:** October 8, 2025  
**Purpose:** Prevent conflicts, maintain quality, preserve context

---

## ⚠️ CRITICAL: ALWAYS FOLLOW THESE RULES

### **RULE #1: ALWAYS USE GIT** 🔴

**Before EVERY coding session:**
```bash
git pull origin master
```

**After EVERY change (no matter how small):**
```bash
git add .
git commit -m "Descriptive message of what changed"
git push origin master
```

**Why:** Prevents conflicts, tracks changes, preserves work

---

## ⚠️ RULE #2: ALWAYS READ MASTER STATUS FIRST 🔴

**Before ANY work:**
1. Read `🎯 MASTER_PROJECT_STATUS.md`
2. Understand current state
3. Check what needs fixing
4. Check priorities

**Why:** Prevents working on wrong things, avoids duplicate effort

---

## ⚠️ RULE #3: ALWAYS UPDATE MASTER STATUS 🔴

**After ANY change:**
1. Test what you changed
2. Update `🎯 MASTER_PROJECT_STATUS.md`
3. Document results (working/broken)
4. Commit and push

**Why:** Keeps everyone informed, prevents confusion

---

## ⚠️ RULE #4: NEVER CREATE NEW STATUS DOCS 🔴

**DON'T:**
- ❌ Create new "status" documents
- ❌ Create new "completion" reports
- ❌ Create new "verification" docs
- ❌ Make claims without updating master

**DO:**
- ✅ Update `🎯 MASTER_PROJECT_STATUS.md`
- ✅ Keep it as single source of truth
- ✅ Always reference this one document

**Why:** Prevents conflicting information

---

## ⚠️ RULE #5: ALWAYS TEST BEFORE CLAIMING 🔴

**Never say something works without:**
1. Actually running the code
2. Seeing it work with your own "eyes"
3. Documenting the test
4. Updating status document

**Why:** Prevents false claims, maintains trust

---

## ⚠️ RULE #6: ALWAYS DOCUMENT CONTEXT 🔴

**Every time you work, document:**
- What you're trying to do
- Why you're doing it
- What you changed
- What the result was
- What still needs doing

**Where:** In `🎯 MASTER_PROJECT_STATUS.md`

**Why:** Future AI sessions need context, prevents lost work

---

## 📋 MANDATORY WORKFLOW

### **Start of Every Session:**

```bash
# Step 1: Pull latest changes
git pull origin master

# Step 2: Read master status
# Open and read: 🎯 MASTER_PROJECT_STATUS.md

# Step 3: Check current state
git status

# Step 4: Understand what needs doing
# Check priorities in master status doc
```

---

### **During Work:**

```bash
# After every file change:
git add .
git status  # Review what changed
git commit -m "Clear description of change"
git push origin master

# After every feature/fix:
# Update 🎯 MASTER_PROJECT_STATUS.md
git add .
git commit -m "Update project status after [feature/fix]"
git push origin master
```

---

### **End of Session:**

```bash
# Step 1: Ensure everything is committed
git status  # Should show "working tree clean"

# Step 2: Final status update
# Update 🎯 MASTER_PROJECT_STATUS.md with:
# - What was accomplished
# - What's still pending
# - Current completion %
# - Next priorities

# Step 3: Commit final status
git add .
git commit -m "Session end: Update project status"
git push origin master

# Step 4: Verify push succeeded
git status  # Should show "up to date with origin/master"
```

---

## 🚨 CONFLICT RESOLUTION

### **If Git Pull Shows Conflicts:**

```bash
# Step 1: See what conflicts
git status

# Step 2: For each conflicting file:
# - Open the file
# - Look for <<<<<<< HEAD
# - Decide which version to keep
# - Remove conflict markers
# - Save file

# Step 3: Mark as resolved
git add [conflicted-file]

# Step 4: Complete the merge
git commit -m "Resolve merge conflicts in [files]"

# Step 5: Push
git push origin master
```

---

## 📝 COMMIT MESSAGE RULES

### **Good Commit Messages:**

```bash
✅ "Fix authentication error in login endpoint"
✅ "Add email validation to registration form"
✅ "Update MASTER_PROJECT_STATUS with test results"
✅ "Resolve import conflicts in unifiedApiService"
✅ "Create comprehensive feature tracker"
```

### **Bad Commit Messages:**

```bash
❌ "Update"
❌ "Changes"
❌ "Fix"
❌ "asdf"
❌ "commit"
```

**Format:**
```
[Action] [What] [Where/Why]

Examples:
- Add user authentication system
- Fix login redirect issue
- Update project status after testing
- Remove deprecated API endpoints
- Refactor database connection logic
```

---

## 🎯 DOCUMENTATION RULES

### **Always Document:**

1. **What Changed**
   - Specific files modified
   - What was added/removed/fixed

2. **Why It Changed**
   - What problem it solves
   - What feature it enables

3. **Test Results**
   - Did it work?
   - What still doesn't work?
   - Any new issues?

4. **Current Status**
   - Is feature complete?
   - Partial? What %?
   - What's next?

---

## 🔍 TESTING RULES

### **Before Claiming Anything Works:**

1. **Actually Run It**
   ```bash
   # Frontend
   cd client-nextjs
   npm run build  # Does it build?
   npm run dev    # Does it run?
   
   # Backend
   cd server
   node db-server.js  # Does it start?
   ```

2. **Test in Browser**
   - Open http://localhost:3005
   - Click every button
   - Test every form
   - Try to break it

3. **Check Console**
   - Any errors?
   - Any warnings?
   - Any 404s?

4. **Test API Endpoints**
   ```bash
   # Use curl or Postman
   POST http://localhost:5000/api/auth/login
   GET http://localhost:5000/api/cases
   POST http://localhost:5000/api/v1/ai/consultation
   ```

5. **Document Results**
   - What works: ✅
   - What's broken: ❌
   - What's unknown: ❓

---

## 📊 STATUS UPDATE TEMPLATE

### **Use This When Updating Master Status:**

```markdown
## Update: [Date] - [Time]

### What I Did:
- [List specific changes]

### Test Results:
- ✅ [What works]
- ❌ [What's broken]
- ❓ [What needs testing]

### Issues Found:
- [Specific error 1]
- [Specific error 2]

### Issues Fixed:
- [Fixed issue 1]
- [Fixed issue 2]

### Current Completion:
- [Feature]: X% complete
- Overall: Y% complete

### Next Steps:
1. [Next task with priority]
2. [Next task with priority]
3. [Next task with priority]

### Blockers:
- [Anything preventing progress]
```

---

## 🎓 LEARNING FROM PAST MISTAKES

### **What Went Wrong Before:**

1. **Multiple Conflicting Status Docs**
   - Solution: ONE master status document

2. **Claims Without Testing**
   - Solution: Always test before claiming

3. **No Git Workflow**
   - Solution: Git commit after every change

4. **Lost Context**
   - Solution: Document everything in master status

5. **No Priority System**
   - Solution: Clear priorities in master status

6. **Incomplete Features**
   - Solution: Track every feature's completion %

---

## ✅ CHECKLIST BEFORE EVERY RESPONSE

### **Before Responding to User:**

- [ ] Pulled latest from GitHub
- [ ] Read MASTER_PROJECT_STATUS.md
- [ ] Understood current state
- [ ] Checked what's prioritized
- [ ] Made changes
- [ ] Tested changes
- [ ] Updated MASTER_PROJECT_STATUS.md
- [ ] Committed to Git
- [ ] Pushed to GitHub
- [ ] Verified push succeeded

**Only THEN respond to user with confidence!**

---

## 🚨 RED FLAGS - STOP IF YOU SEE THESE

### **Warning Signs:**

1. **About to create another status document**
   → STOP! Update the master instead

2. **About to claim something works without testing**
   → STOP! Test it first

3. **Haven't committed in a while**
   → STOP! Commit now

4. **Not sure what the current state is**
   → STOP! Read master status first

5. **Multiple versions of same file**
   → STOP! Resolve conflicts

6. **Working on low priority while high priority broken**
   → STOP! Fix priorities first

---

## 💡 BEST PRACTICES

### **Do's:**

1. ✅ Commit often (after every logical change)
2. ✅ Push often (don't let commits pile up)
3. ✅ Test everything you change
4. ✅ Document in master status
5. ✅ Be honest about what works/doesn't
6. ✅ Prioritize critical issues
7. ✅ Ask for clarification when unsure
8. ✅ Read existing code before changing
9. ✅ Keep context documents updated
10. ✅ Use descriptive commit messages

### **Don'ts:**

1. ❌ Create duplicate documentation
2. ❌ Make claims without testing
3. ❌ Ignore Git conflicts
4. ❌ Skip documentation updates
5. ❌ Work without priorities
6. ❌ Lose context between sessions
7. ❌ Commit broken code
8. ❌ Push without testing
9. ❌ Make vague commit messages
10. ❌ Work in isolation without Git

---

## 🎯 SUCCESS METRICS

### **You're Doing Well When:**

- ✅ Git history shows frequent, clear commits
- ✅ MASTER_PROJECT_STATUS is always current
- ✅ No conflicting documentation exists
- ✅ Every claim is backed by tests
- ✅ Context is preserved between sessions
- ✅ Priorities are clear and followed
- ✅ User knows exact current state
- ✅ No surprises or false claims

---

## 📞 FOR FUTURE AI SESSIONS

### **When You Start Working on This Project:**

1. **First Action:** Read this document completely
2. **Second Action:** Read `🎯 MASTER_PROJECT_STATUS.md`
3. **Third Action:** `git pull origin master`
4. **Fourth Action:** Understand what's priority
5. **Then:** Start working

### **Golden Rule:**

> **"If it's not in Git and documented in MASTER_PROJECT_STATUS,  
> it doesn't exist and wasn't done."**

---

## 🔐 COMMIT THIS FILE TO MEMORY

**Every AI session should:**
1. Read this file
2. Follow these rules
3. Update status document
4. Commit to Git
5. Push to GitHub

**No exceptions. No shortcuts. No assumptions.**

---

<div align="center">

# 🎯 QUALITY THROUGH DISCIPLINE

**Git + Documentation + Testing = Success**

</div>

---

*Rules Version: 1.0.0*  
*Created: October 8, 2025*  
*Purpose: Prevent chaos, maintain quality, preserve context*  
*Status: MANDATORY - All AI assistants must follow*

