import type { Lesson } from '../../types/curriculum';

export const linuxLessons: Lesson[] = [
  {
    id: 'lin_0',
    title: 'The Linux Philosophy',
    badge: 'Foundations',
    badgeClass: 'badge-concept',
    content: [
      'Linux is the "Language of the Cloud". Almost every server on the internet (including this one) runs on Linux. Unlike Windows or macOS, Linux is built on the philosophy of **"Small, Sharp Tools"** that do one thing well and work together.',
      'Everything in Linux is a File. Your text documents, your hard drive, and even your computer\'s microphone are represented as files in the system. This allows you to use the same basic commands to manage almost everything.',
      'The "Command Line Interface" (CLI) is not just for hackers; it is the most efficient way to manage a computer. By mastering the terminal, you can automate complex tasks in seconds that would take hours of clicking in a graphical interface.'
    ],
    code: `# ── The anatomy of a command ──
# [Command] [Options] [Arguments]
ls -la /var/log

# -l: long format (details)
# -a: all (show hidden files starting with .)
# /var/log: the directory to look at`
  },
  {
    id: 'lin_1',
    title: 'Navigation & File Operations',
    badge: 'Core',
    badgeClass: 'badge-practice',
    content: [
      'Navigation is the most fundamental skill. `pwd` (print working directory) tells you where you are, `ls` shows you what\'s there, and `cd` (change directory) moves you around. Mastering these is like learning to walk in the Linux world.',
      'File operations (`cp` for copy, `mv` for move/rename, `rm` for remove) are powerful. Be careful: unlike a desktop OS, the Linux terminal has no "Recycle Bin". When you `rm` a file, it is gone forever.',
      'Using **Path Shortcuts**: `.` refers to the current folder, `..` refers to the parent folder, and `~` refers to your "Home" directory. Combining these with `ls` or `cd` allows you to navigate the entire system with just a few keystrokes.'
    ],
    code: `# ── Moving around ──
pwd             # Where am I?
ls -F           # Show files with types (/ for folders)
cd ~/Documents  # Go home, then to Documents

# ── Managing files ──
touch notes.txt         # Create empty file
mkdir my-project         # Create folder
cp notes.txt backup.txt # Copy
mv notes.txt ideas.txt   # Rename
rm ideas.txt             # ⚠️ Delete forever!`
  },
  {
    id: 'lin_2',
    title: 'Users, Groups & Permissions',
    badge: 'Security',
    badgeClass: 'badge-concept',
    content: [
      'Linux is built for multiple users. Access to files is controlled by a strict **Permission System** based on three categories: Owner, Group, and Others. Each category can have Read (`r`), Write (`w`), and Execute (`x`) permissions.',
      'The `chmod` command is how you change these permissions. If a script you wrote won\'t run, it\'s likely because it doesn\'t have the "Execute" permission enabled. You also use `chown` to change who owns a file.',
      '**Sudo (SuperUser Do)**: Some actions (like installing software or editing system configs) require administrative power. Prefixing a command with `sudo` tells Linux: "I have the authority to do this". Use it sparingly — with great power comes great responsibility.'
    ],
    code: `# ── Viewing Permissions ──
# -rwxr-xr-- 1 user group ...
# | |_|_|
# |  | | |__ Others: Read only
# |  | |____ Group:  Read & Execute
# |  |______ Owner:  Read, Write, Execute

# ── Changing Permissions ──
chmod +x script.sh    # Make it executable
chmod 700 secret.txt  # Only owner can read/write

# ── Using Sudo ──
sudo apt update       # Update system packages as admin`
  },
  {
    id: 'lin_3',
    title: 'Pipes, Filters & Redirection',
    badge: 'Advanced',
    badgeClass: 'badge-concept',
    content: [
      'This is where Linux becomes a "Superpower". A **Pipe** (`|`) takes the output of one command and feeds it as the input to the next. You can string together 5 simple commands to perform an incredibly complex data analysis task.',
      '**Redirection** allows you to send command output to a file instead of the screen. `>` creates a new file (overwriting), while `>>` appends to the end of an existing file. Perfect for generating logs.',
      'Grep is the ultimate "filter" tool. It searches for specific patterns of text. Combining `cat` (read file) | `grep` (find something) | `sort` (organize) is a common pattern that helps you find a needle in a haystack of data.'
    ],
    code: `# ── The Power of the Pipe ──
# Find all "Error" messages in a log, 
# sort them, and count the uniques:
cat server.log | grep "ERROR" | sort | uniq -c

# ── Redirection ──
ls /var/log > my_logs.txt    # Create file with list
echo "Server started" >> logs.txt # Add to the end`
  },
  {
    id: 'lin_4',
    title: 'Process Management: Task Control',
    badge: 'Core',
    badgeClass: 'badge-practice',
    content: [
      'Every running program is a **Process** with a unique PID (Process ID). You can view all running processes with `top` or `htop`. If a program "Freezes", you can stop it instantly using the `kill` command with its PID.',
      'You can run commands in the **Background** by adding an `&` at the end. This allows you to keep using the terminal while the task runs. You can also "Background" a running task using `Ctrl+Z` and then `bg`.',
      'Environment Variables: Linux uses variables like `$PATH` (where it looks for commands) and `$USER` to store system info. You can see all of them with the `env` command. Adding variables to your `.bashrc` or `.zshrc` file makes them permanent.'
    ],
    code: `# ── Viewing Processes ──
ps aux | grep "node"   # Find my Node.js processes
top                    # Interactive system monitor

# ── Stopping a Process ──
kill 1234              # Try to exit gracefully
kill -9 1234           # Force kill immediately

# ── Variables ──
echo $PATH             # See where commands live
export APP_PORT=3000   # Set a temporary variable`
  },
  {
    id: 'lin_5',
    title: 'Package Management: apt & yum',
    badge: 'Practice',
    badgeClass: 'badge-practice',
    content: [
      'You don\'t go to a website to download an `.exe` file in Linux. You use a **Package Manager** like `apt` (Ubuntu/Debian) or `yum` (CentOS/RedHat). It is like an "App Store" for developers, but managed entirely through the terminal.',
      'Package managers handle "Dependencies" for you. If you want to install Python, and Python needs a specific math library, `apt` will find and install both for you automatically. This ensures your software has everything it needs to run.',
      'Maintenance is easy: one command, `sudo apt upgrade`, updates every single piece of software on your machine to the latest secure version. This is why Linux is considered the most secure and up-to-date operating system for servers.'
    ],
    code: `# ── Debian/Ubuntu (APT) workflow ──

sudo apt update        # 1. Refresh list of available apps
sudo apt install htop  # 2. Download and install htop
sudo apt remove htop   # 3. Uninstall

# ── Search for a tool ──
apt search nodejs`
  },
  {
    id: 'lin_6',
    title: 'SSH: Connecting to the World',
    badge: 'Cloud',
    badgeClass: 'badge-concept',
    content: [
      '**SSH (Secure Shell)** is the protocol used to securely connect to a remote computer. It is how you "Login" to a server running in the cloud (like Amazon AWS or Google Cloud) and manage it as if you were sitting right in front of it.',
      'Instead of passwords (which are vulnerable), professional developers use **SSH Keys**. This is a pair of files: a "Public Key" that you put on the server, and a "Private Key" that stays on your computer. It is virtually impossible to hack.',
      'Once connected via SSH, you have full terminal access to the remote machine. You can move files back and forth securely using `scp` (Secure Copy). This is the foundation of almost all modern deployment and server management.'
    ],
    code: `# ── Connect to a server ──
ssh username@192.168.1.10

# ── Create SSH Keys ──
ssh-keygen -t ed25519 -C "your_email@example.com"

# ── Copy a file TO the server ──
# scp [LocalFile] [User]@[RemoteHost]:[RemotePath]
scp ./index.js admin@my-server.com:/var/www/app/`
  },
  {
    id: 'lin_7',
    title: 'Project Execution: Server Hardening',
    badge: 'Project',
    badgeClass: 'badge-practice',
    content: [
      'In this task, you will play the role of a System Administrator. You will log into a new Linux server, create a non-root user for security, set up SSH key authentication, and install a Node.js runtime using the package manager.',
      'The goal is to move from a "Raw" machine to a "Production Ready" server. You must also configure basic permissions so that the application can write its own logs but cannot edit its own source code (a key security best practice).',
      '**Studio Task**: Prepare the "JobTrackr-Prod" box. Create the `deploy` user, disable password login for SSH, and create a system log folder with `775` permissions.'
    ],
    code: `# ── Implementation Checklist ──
# 1. Sudo user created?       [Yes]
# 2. Password auth disabled?  [Yes]
# 3. Node.js installed?       [Yes]
# 4. Folder permissions set?  [Yes]

# ── Quick Security check ──
# "The less software installed, the less can be hacked."`
  }
];
