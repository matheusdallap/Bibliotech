export async function authLogin(formData) {
  try {
    const response = await fetch("http://localhost:8000/client/login/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(formData)
    });

    if (!response.ok) {
      throw new Error(`Erro na requisição: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.success && result.data) {
      const accessToken = result.data.access;
      const refreshToken = result.data.refresh;

      localStorage.setItem("access_token", accessToken);
      localStorage.setItem("refresh_token", refreshToken);

      console.log("Tokens salvos:", {
        access: accessToken,
        refresh: refreshToken
      });
    }

    return result;

  } catch (error) {
    console.error("Erro ao fazer login:", error);
    return null;
  }
}
