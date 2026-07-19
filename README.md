# TestGame


## Why Doesnt Cursor Work On Linux
This is a very common issue on Linux laptops (and some Windows laptops) called "Disable Touchpad While Typing" (Palm Rejection).

Because WASD are standard letter keys, the Linux input driver assumes you are typing a document and temporarily disables the touchpad to prevent your palm from accidentally moving the cursor or clicking. Arrow keys often work because drivers classify them as "navigation" keys rather than "typing" keys.
How to fix it (System Level)

Since this is an OS/Driver level behavior, you cannot fix it with JavaScript code. You have to disable this feature in your Linux settings:
For GNOME (Ubuntu, Fedora, etc.):

    Open Settings.
    Go to Mouse & Touchpad.
    Toggle OFF "Disable Touchpad While Typing" (or "Tap to Click" settings sometimes hide this).

Via Terminal (Universal for GNOME):
Run

gsettings set org.gnome.desktop.peripherals.touchpad disable-while-typing false

For KDE Plasma:

    Go to System Settings > Input Devices > Touchpad.
    Look for the Pointer Motion or Tapping tab.
    Uncheck "Disable touchpad when typing".

Why your code is fine

Your
input.js and
game.js are written correctly:

    event.preventDefault() is good—it stops the browser from scrolling when you press keys.
    Using Set for key tracking is the industry standard for smooth movement.
    The mousemove listener in
    game.js is standard.

The reason it works on other operating systems is that Windows and macOS often have more "intelligent" palm rejection that recognizes when a game is in the foreground, or they don't disable the mouse entirely, whereas Linux drivers (libinput/synaptics) can be more aggressive by default.

Verdict: Your code is not the problem; it's a Linux hardware-protection setting! If you are sharing this game with others, they likely won't have this issue unless they are also on a Linux laptop with default settings.

im on linux mint how do i fix it there

On Linux Mint (which usually uses the Cinnamon desktop environment), this feature is enabled by default to prevent "ghost clicks" while typing.

Here is how to disable it so you can play your game with WASD and the touchpad simultaneously:
Method 1: Using the Graphic Interface (Easiest)

    Open your Mint Menu (bottom left corner).
    Type "Mouse and Touchpad" and open that application.
    Switch to the Touchpad tab at the top.
    Look for the setting: "Disable touchpad while typing".
    Switch the toggle to OFF.

Method 2: Using the Terminal (Fastest)

If you are using the default Cinnamon edition of Mint, copy and paste this command into your terminal:
Run

gsettings set org.cinnamon.desktop.peripherals.touchpad disable-while-typing false

Note: If you are using the MATE edition of Mint, the command is: gsettings set org.mate.peripherals-touchpad disable-while-typing false
Why this happens specifically on Mint/Linux:

Linux uses a driver called libinput. By default, libinput sees the W, A, S, and D keys as "keyboard keys" and the touchpad as a "touchpad." It assumes that if you are hitting letters, you are writing an email, so it ignores the touchpad for about 500ms to prevent your palm from clicking somewhere else.

Once you turn that setting off, the OS will stop trying to "protect" you, and your game should work perfectly with WASD!
