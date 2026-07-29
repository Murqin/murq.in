# Fedora Migration Notes: Anti-Cheat Workarounds, Drivers, and My AI Usage

Lately, I have been using Linux-based distributions and GNU/Linux systems for my daily computing. I view operating systems simply as tools that allow us to carry out daily tasks, produce work, or play games. Whether developed by Microsoft or built by open-source communities, I prefer whichever out-of-the-box system serves my immediate purpose.

Frankly, I am not championing a "Linux crusade." Different operating systems excel in different areas, and I choose them strictly based on my needs:

- **Windows:** Highly effective due to day-one support for online multiplayer games (such as PUBG, CS FACEIT, and League of Legends) and their kernel-level anti-cheat software. Because of this, I maintain Windows as a secondary operating system in a dual-boot setup specifically for these games.
    
- **Linux:** My primary choice for software development, playing single-player games, and server installations due to its minimal footprint and low memory consumption.
    

## CachyOS to Fedora: The Forced Migration and Driver Setup

For a long time, CachyOS was my main distribution, and I was quite attached to it. However, recent restrictions imposed by anti-cheat systems forced me to migrate to Fedora. Because kernel-level anti-cheat software queries motherboard modules and TPM data, any perceived incompatibility results in blocked access to the game.

When attempting to play FACEIT, I encountered a Secure Boot attestation error. Despite attempting signed boot configurations and Shim on CachyOS, the issue remained unresolved. Fedora, by contrast, utilizes the Microsoft-signed Shim bootloader, allowing it to pass hardware-level authentication during startup seamlessly.

Transitioning to Fedora presented significant driver and signature challenges under Secure Boot:

- **Secure Boot and Nvidia:** Because my BIOS was set to "Maximum Security" mode, the system rejected default keys. Using AI-assisted research, I learned how to generate a custom key file and enroll it directly into the motherboard's UEFI `db` (Signature Database). This allowed Secure Boot to accept Nvidia's proprietary driver signature.
    
- **SELinux and Desktop Freezes:** During the migration, I transferred my `/home` directory directly from CachyOS. However, Fedora's SELinux security module enforces specific security context labels on files. Because the transferred configuration files lacked these labels, access was blocked, leaving KDE unable to load user settings and resulting in a black screen. Guided by AI, I switched to a TTY terminal and ran `restorecon` to reset the security labels to Fedora's defaults, resolving the issue.
    

Resolving these setup issues took over half a day. Without AI, navigating forums might have taken days; its immediate troubleshooting suggestions brought the system back to a fully operational state.

## Arch (AUR) vs. Fedora (COPR & Flatpak)

Switching distributions required adapting my package management habits:

- **AUR (Arch User Repository):** AUR allows you to quickly inspect the `PKGBUILD` file in the terminal before installation. You can review where the source code originates, what actions it executes, and whether it contains malicious commands (using AI for analysis if necessary). Even without reviewing the entire codebase, inspecting the build recipe at installation offers significant transparency and control.
    
- **COPR (Fedora):** While COPR follows a similar community model, packages are compiled server-side via `.spec` files and distributed as pre-built binary `.rpm` packages. Although build recipes can be checked on the website, installing via `dnf` lacks the real-time recipe inspection step present in AUR, reducing that sense of direct control.
    

Because COPR is less comprehensive than AUR and lacks pre-install inspection, I turned to Flatpak for certain applications (such as Zen Browser). However, Flatpak introduces its own trade-offs:

- **Integration Issues:** Isolated execution means Flatpak apps do not always respect system themes. Despite using a Mac theme on KDE, some apps default to standard GTK/Qt borders.
    
- **Permission Constraints:** If maintainers do not configure default permissions precisely, file access issues can occur.
    

## The Role of AI in Software and Daily Life

Using AI significantly lightens my cognitive load. Delegating secondary details or complex system configurations to AI allows me to focus on core concepts.

- **Software Development:** When starting a project, I consult AI on architecture and technology stack choices. At times, I use a code agent for iterative development through trial and error.
    
- **Daily Life:** I also use it outside of tech. Recently, after being bitten by an aggressive insect, I used AI to narrow down possibilities, determining it was likely a sandfly (_Tatarcık_) bite.
    

I understand why some people maintain a skeptical stance toward AI. Concerns generally stem not from the utility of the technology itself, but from corporate data collection policies and differing ideological positions.

## Hobbies and Musical Instruments

Over time, I have explored various practical hobbies:

- **Drawing:** Purchased a graphics tablet to experiment with visual art.
    
- **Piano:** Acquired a MIDI keyboard. Piano proved accessible; basic rhythms and melodies can be played within an hour or two of practice. However, I eventually sold it due to physical key count constraints.
    
- **Guitar & Harmonica:** String and wind instruments demand consistent daily technical exercises simply to produce a clean tone. I plan to sell my Ibanez guitar once a friend is ready to buy it.
    

## Career, Tech Industry, and GitHub Profiles

Realistically, securing employment and income is necessary. While I am open to working in software development, I do not consider myself an "expert"—I build projects at a hobbyist level.

Claiming expert status at a company and subsequently making major errors while migrating a codebase to another language would lead to embarrassment and job loss. Therefore, I avoid overstating my technical scope.

On GitHub, many hobbyist developers maintain highly polished, professional profiles. My own profile reflects a more pragmatic approach: I frequently use AI to write commit messages and prioritize functional output over public presentation.

## Conclusion

In about 20 minutes of recording my thoughts and technical steps, I used AI to structure the narrative into a clear, readable format. Across operating systems, software development, and daily tasks, the objective remains utility rather than elitism—leveraging available tools to achieve practical results efficiently.
