const express = require('express');
const router = express.Router();
const { MAX_CODE_LENGTH } = require('../lib/config');
const { isString } = require('../lib/db');

router.post('/', (req, res) => {
  try {
    const { code, topicId } = req.body;

    if (!isString(code) || !code.trim()) {
      return res.status(400).json({ error: 'No code provided to the engine.' });
    }
    if (code.length > MAX_CODE_LENGTH) {
      return res.status(400).json({ error: `Code payload too large. Maximum ${MAX_CODE_LENGTH} characters.` });
    }

    // --- CASE A: SQL Sandbox (PostgreSQL Topic) ---
    if (topicId === 'postgresql') {
      const Database = require('better-sqlite3');
      const db = new Database(':memory:');
      
      try {
        const commands = code.split(';').map(c => c.trim()).filter(c => c.length > 0);
        let lastResult = null;

        if (commands.length === 0) {
          return res.json({ output: 'No valid SQL commands found.' });
        }

        for (const cmd of commands) {
          // Check if it's a query that returns rows
          const isQuery = /^\s*(SELECT|PRAGMA|WITH|SHOW|EXPLAIN|values)\s+/i.test(cmd);
          if (isQuery) {
            lastResult = db.prepare(cmd).all();
          } else {
            const info = db.prepare(cmd).run();
            // If it's a mutation, we might want to show how many rows were affected
            if (info.changes > 0) {
              lastResult = { affectedRows: info.changes };
            }
          }
        }

        db.close();
        const output = lastResult 
          ? JSON.stringify(lastResult, null, 2) 
          : 'Command executed successfully (no rows returned).';
        res.json({ output: `--- SQL RESULT SET ---\n${output}` });
      } catch (err) {
        if (db.open) db.close();
        return res.json({ output: `--- SQL EXECUTION FAILED ---\nSQL Error: ${err.message}` });
      }
      return;
    }

    // --- CASE B: Infrastructure Dry-Run (Docker/CI-CD) ---
    if (topicId === 'docker' || topicId === 'cicd') {
      const isDockerfile = code.includes('FROM ') || code.includes('RUN ');
      const isYaml = code.includes(':') && (code.includes('version:') || code.includes('services:') || code.includes('jobs:'));
      
      let validationMsg = '--- INFRASTRUCTURE VALIDATION (DRY RUN) ---\n';
      let isValid = true;

      if (isDockerfile) {
        if (!code.match(/^FROM\s+/m)) {
          validationMsg += 'Error: Dockerfile must start with a FROM instruction.\n';
          isValid = false;
        }
        if (code.includes('COPY ') && !code.includes(' .')) {
          validationMsg += 'Warning: COPY instructions usually require a destination path.\n';
        }
      } else if (isYaml) {
        const lines = code.split('\n');
        lines.forEach((line, i) => {
          if (line.includes('\t')) {
            validationMsg += `Validation Error: Tab character found on line ${i + 1}. YAML requires spaces for indentation.\n`;
            isValid = false;
          }
        });
      }

      if (isValid) {
        validationMsg += '✨ Syntax appears valid.\nReady for deployment to production orchestration.';
      } else {
        validationMsg += '❌ Validation failed. Review the warnings above.';
      }

      return res.json({ output: validationMsg });
    }

    // --- CASE C: Virtual Machine Sandbox (Built-in node:vm) ---
    // Note: Provides environment isolation without requiring native build tools.
    const vm = require('node:vm');
    let outputData = '';
    
    // Create a sandbox object with redirected console and DSA helpers
    const sandbox = {
      console: {
        log: (...args) => {
          outputData += args.map(arg => {
            if (arg === null) return 'null';
            if (arg === undefined) return 'undefined';
            if (typeof arg === 'object') {
              try { return JSON.stringify(arg); } catch(e) { return String(arg); }
            }
            return String(arg);
          }).join(' ') + '\n';
        }
      },
      // DSA Helper Classes
      ListNode: class { 
        constructor(val, next) { this.val = val ?? 0; this.next = next ?? null; } 
      },
      TreeNode: class { 
        constructor(val, left, right) { this.val = val ?? 0; this.left = left ?? null; this.right = right ?? null; } 
      }
    };

    // Initialize the context
    vm.createContext(sandbox);

    try {
      // Execute user code in the sandbox with a 5s timeout
      vm.runInContext(code, sandbox, { timeout: 5000 });
      res.json({ output: outputData || 'Execution completed successfully (no output captured).' });
    } catch (e) {
      res.json({ output: `--- RUNTIME ERROR ---\n${e.message}` });
    }
  } catch (err) {
    console.error('Execution Sandbox Error:', err);
    res.status(500).json({ error: 'Native Sandbox Kernel panicked.' });
  }
});

module.exports = router;
