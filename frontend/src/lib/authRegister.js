export async function authRegister(formData) {
  try {
    const response = await fetch("http://localhost:8000/client/register/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(formData)
    });

  const data = await response.json();
  
  return data;

  } catch (error) {
    return {
      success: false,
      message: "Erro de conexão com o servidor."
    };
  }
} 