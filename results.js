const chartContains = document.querySelectorAll(".chart_contains")
const chartHeadlines = document.querySelectorAll(".charts_headline")

//calculate percentage of votes for each parti and manipulate css
async function calculatePercentage(){
    const partier = await getPartier();
    
    let totalVotes = 0;
    for(let i = 0; i < partier.length; i++){
        totalVotes += partier[i].votes
    }
    
    for(let i = 0; i < partier.length; i++){
        let percentage = partier[i].votes / totalVotes * 100
        console.log(percentage)
        chartContains[i].style.width = `${percentage}%`;

        const percentageShown = document.createElement('p');
        percentageShown.innerHTML += `${Math.floor(percentage*100) / 100}%`;
        chartHeadlines[i].appendChild(percentageShown)
    }

    console.log(totalVotes)
}

calculatePercentage();