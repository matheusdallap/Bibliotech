export async function authRegister(formData) {
  try {
    const response = await fetch("http://localhost:8000/client/register/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(formData)
    });

    if (!response.ok) {
      return { success: false };
    }

    return await response.json();

  } catch (error) {
    return { success: false };
  }
}