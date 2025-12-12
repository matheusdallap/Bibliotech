
export async function authLogout() {
  const refresh = localStorage.getItem("refresh_token");
  const access = localStorage.getItem("access_token");

  if (!refresh || !access) {
    return { success: false, message: "Usuário não autenticado." };
  }

  try {
    const response = await fetch("http://localhost:8000/client/logout/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${access}`
      },
      body: JSON.stringify({ refresh })
    });

    const data = await response.json();

   
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");

    return data;

  } catch (error) {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    return { success: false, message: "Erro ao tentar logout." };
  }
}
