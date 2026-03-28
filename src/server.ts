(async () => {
    try {
        // Now we dynamically import the rest of the application!
        await import('./bootstrap');

    } catch (error) {
        console.error("Fatal Application Startup Error:", error);
        process.exit(1);
    }
})();
