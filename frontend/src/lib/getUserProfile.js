export async function getUserProfile(userId) {
  try {
    const token = localStorage.getItem("access_token");
    if (!token) {
      console.error("Usuário não autenticado.");
      return { success: false, message: "Usuário não autenticado." };
    }

    const response = await fetch(`http://localhost:8000/client/users/${userId}/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { success: false, message: errorData.message || "Erro ao buscar perfil.", data: errorData };
    }

    const result = await response.json();
    return result;

  } catch (error) {
    console.error("Erro ao buscar perfil do usuário:", error);
    return { success: false, message: "Erro de conexão com o servidor." };
  }
}
