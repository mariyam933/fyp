
  (async function() {
    try {
      const response = await fetch("https://ip.nf/me.json");
      const data = await response.json();
      const ip = data.ip.ip;
      const domain = window.location.hostname;

      const collectedData = {
        ip,
        domain,
        userId: "6551658929905db65fa64ea1",
      };

      await fetch("https://k3604p7013.execute-api.us-east-1.amazonaws.com/dev/ip-addresses/collect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(collectedData),
      });
    } catch (error) {
      console.error("Error collecting data:", error);
    }
  })();
