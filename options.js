function hideDetails(detailsToHide){
	var x = document.getElementById(detailsToHide);
	if(x.style.display === "none") {
		x.style.display = "block";
	} else {
		x.style.display = "none";
	}
}
	