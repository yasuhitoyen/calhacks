  useEffect(() => {
	const fetchPreferences = async () => {
	try {
	  // Ensure we’re sending a clean array of ints 1-6
	  const prefCodes = userPreferences
		.map(Number)
		.filter(n => Number.isInteger(n) && n >= 1 && n <= 6);

	  const response = await fetch('http://localhost:3000/api/all', {
		method: 'POST',
		headers: {
		  'Content-Type': 'application/json',
		  'X-Zip-Code': zipCode            // omit or customise if you don’t need it
		},
		body: JSON.stringify(prefCodes)    // send the cleaned array, e.g. [1,3,5]
	  });

	  if (!response.ok) {
		throw new Error(`Request failed with ${response.status}`);
	  }

	  // server responds with { data, filters, … }
	  const { data } = await response.json();
	  setAvailablePreferences(data);        // ‘data’ holds the filtered rows
  } catch (err) {
	console.error('Error fetching preferences:', err);
  }
};
	
	// Only fetch if we have preferences and haven't fetched recently
	if (userPreferences.length > 0 && Date.now() - lastFetchRef.current > FETCH_WINDOW) {
	  fetchPreferences();
	}
  }, [userPreferences.length]); // FIXED: Only depend on length, not the array itself
