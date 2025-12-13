export async function authLogin(formData) {
  try {
    const response = await fetch("http://localhost:8000/client/login/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData)
    });

    if (!response.ok) {
      return { success: false, message: "Erro ao fazer login." };
    }

    const result = await response.json();

    if (!result.success) return result;

    return {
      success: true,
      user: {
        id: result.data.user_id,
        username: result.data.username,
        email: result.data.email,
        first_name: result.data.first_name,
        is_admin: result.data.is_admin
      },
      access: result.data.access,
      refresh: result.data.refresh
    };

  } catch (err) {
    return { success: false, message: "Falha de comunicação com servidor." };
  }
}
