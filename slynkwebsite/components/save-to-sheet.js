const SHEET_API_URL = "https://sheetdb.io/api/v1/776l4ucbn84li"; // Replace with your SheetDB API URL

export async function saveToSheet(data) {
  try {
    const response = await fetch(SHEET_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        data: [data], // Send the form data as an array
      }),
    });

    if (response.ok) {
      console.log("Data saved successfully:", data);
      return { success: true, message: "Data saved successfully" };
    } else {
      console.error("Failed to save data:", response.statusText);
      return { success: false, message: "Failed to save data" };
    }
  } catch (error) {
    console.error("Error saving data:", error);
    return { success: false, message: "An error occurred while saving data" };
  }
}