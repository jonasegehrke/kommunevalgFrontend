const valgAPI = `http://localhost:8080`;
const kandidatTable = document.querySelector(".kandidat_table")
const collapseBtn = document.querySelectorAll(".collapse_btn")
const newKandidatBtn = document.querySelector(".new-kandidat-btn")

const nameInput = document.querySelector(".name-input")
const votesInput = document.querySelector(".votes-input")
const partiDropdown = document.querySelector(".parti-drop-down")




//create table from the selecet parti
async function createTable(partiName) {

    //remove old rows
    const oldRow = document.querySelectorAll(".current_row")
    for (let i = 0; i < oldRow.length; i++) {
        oldRow[i].remove();
    }


    let resp = null;

    //if all parti wants to be showed
    if (partiName === 'ALL') {
        resp = await fetch(valgAPI + "/kandidat");
    } else {
        resp = await fetch(valgAPI + "/kandidat/" + partiName);
    }

    const respData = await resp.json();

    //iterrate and complete html
    for (let i = 0; i < respData.length; i++) {
        let rowCount = kandidatTable.rows.length;
        let row = kandidatTable.insertRow(rowCount);
        row.classList.add("current_row")

        row.insertCell(0).innerHTML = `<p>${respData[i].kandidatId}</p>`
        row.insertCell(1).innerHTML = `<p contenteditable="true">${respData[i].name}</p>`
        row.insertCell(2).innerHTML = `<p contenteditable="true">${respData[i].votes}</p>`
        row.insertCell(3).innerHTML = `<p>${respData[i].parti.name}</p>`
        row.insertCell(4).innerHTML = `<a onclick="saveRow(this)"><button type="button" class="btn btn-secondary uil uil-save"></button></a>`
        row.insertCell(5).innerHTML = `<a onclick="deleteRow(this)"> <button type="button" class="btn btn-secondary uil uil-trash-alt"></button></a>`;
    }

}

//save changes for edits on rows
async function saveRow(rowObj) {
    let row = rowObj.parentNode.parentNode;
    let table = row.parentNode;


    const partier = await getPartier();
    const kandidater = await getKandidater();



    //loop parti and kandidat
    for (let i = 0; i < partier.length; i++) {
        if (row.childNodes[3].firstChild.textContent == partier[i].name) {
            for (let j = 0; j < kandidater.length; j++) {
                if (kandidater[j].kandidatId === parseInt(row.childNodes[0].firstChild.firstChild.nodeValue)) {

                    //If new votes are smaller than old
                    if (kandidater[j].votes > parseInt(row.childNodes[2].firstChild.textContent)) {
                        const diff = kandidater[j].votes - parseInt(row.childNodes[2].firstChild.textContent)
                        const newParti = {
                            partiId: partier[i].partiId,
                            name: partier[i].name,
                            partiLetter: partier[i].partiLetter,
                            votes: partier[i].votes - diff
                        }
                        await updateParti(newParti);

                        //If new votes are larger than old
                    } else if (kandidater[j].votes < parseInt(row.childNodes[2].firstChild.textContent)) {
                        const diff = (kandidater[j].votes - parseInt(row.childNodes[2].firstChild.textContent)) * -1
                        const newParti = {
                            partiId: partier[i].partiId,
                            name: partier[i].name,
                            partiLetter: partier[i].partiLetter,
                            votes: partier[i].votes + diff
                        }
                        await updateParti(newParti);
                    }

                    //update kandidat
                    const kandidat = {
                        kandidatId: row.childNodes[0].firstChild.textContent,
                        name: row.childNodes[1].firstChild.textContent.replaceAll("\t", ""),
                        votes: parseInt(row.childNodes[2].firstChild.textContent),
                        parti: partier[i]
                    }
                    await updateKandidat(kandidat)

                    alert("Update Finished")
                }
            }
        }
    }
}



//delete row
async function deleteRow(rowObj) {
    let row = rowObj.parentNode.parentNode;
    let table = row.parentNode;


    //loop parti to find rest of parti data
    const partier = await getPartier();
    for (let i = 0; i < partier.length; i++) {
        if (row.childNodes[3].firstChild.firstChild.nodeValue === partier[i].name) {
            const newParti = {
                partiId: partier[i].partiId,
                name: partier[i].name,
                partiLetter: partier[i].partiLetter,
                votes: partier[i].votes - parseInt(row.childNodes[2].firstChild.textContent)
            }


            await updateParti(newParti);
        }
    }


    await deleteKandidat(row.childNodes[0].firstChild.firstChild.nodeValue);
    table.removeChild(row);
    alert("Delete Finished")
}


//create kandidat
if(newKandidatBtn){
newKandidatBtn.addEventListener('click', async (e) => {
    if (partiDropdown.value == "--Choose--") {
        return;
    }

    //use index from dropdown value to find correct parti
    const index = parseInt(partiDropdown.value);

    const partier = await getPartier();
    const parti = {
        partiId: partier[index].partiId,
        name: partier[index].name,
        partiLetter: partier[index].partiLetter,
        votes: partier[index].votes
    }

    const kandidat = {
        name: nameInput.value,
        votes: parseInt(votesInput.value),
        parti: parti
    }

    //parti votes + new votes
    const newParti = {
        partiId: partier[index].partiId,
        name: partier[index].name,
        partiLetter: partier[index].partiLetter,
        votes: partier[index].votes + parseInt(votesInput.value)
    }


    await updateParti(newParti);
    await createKandidat(kandidat);

    alert("Kandidat Created")
})
}


/*--------------- API mappings ---------------*/

async function deleteKandidat(id) {
    await fetch(valgAPI + "/kandidat/" + id, {
        method: "DELETE",
        headers: { "Content-type": "application/json; charset=UTF-8" }
    })
}

async function createKandidat(data) {
    await fetch(valgAPI + "/kandidat", {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-type": "application/json; charset=UTF-8" }
    })
}

async function updateParti(data) {
    await fetch(valgAPI + "/parti", {
        method: "PUT",
        body: JSON.stringify(data),
        headers: { "Content-type": "application/json; charset=UTF-8" }
    })
}

async function updateKandidat(data) {
    await fetch(valgAPI + "/kandidat", {
        method: "PUT",
        body: JSON.stringify(data),
        headers: { "Content-type": "application/json; charset=UTF-8" }
    })
}

async function getPartier() {
    const resp = await fetch(valgAPI + "/parti");
    const respData = await resp.json();

    return respData;
}

async function getKandidater() {
    const resp = await fetch(valgAPI + "/kandidat");
    const respData = await resp.json();

    return respData;
}


//function for easy test data. (Data from: https://www.kmdvalg.dk/kv/2021/K84982219.htm)
async function createInitialKandidates() {

    //get Partier
    const partier = await getPartier();

    const socialdemokratiet = {
        partiId: partier[0].partiId,
        name: partier[0].name,
        partiLetter: partier[0].partiLetter,
        votes: partier[0].votes
    }

    const radikaleVenstre = {
        partiId: partier[1].partiId,
        name: partier[1].name,
        partiLetter: partier[1].partiLetter,
        votes: partier[1].votes
    }

    const konservativeFolkeparti = {
        partiId: partier[2].partiId,
        name: partier[2].name,
        partiLetter: partier[2].partiLetter,
        votes: partier[2].votes
    }

    const nyeBorgerlige = {
        partiId: partier[3].partiId,
        name: partier[3].name,
        partiLetter: partier[3].partiLetter,
        votes: partier[3].votes
    }

    const socialistiskFolkeparti = {
        partiId: partier[4].partiId,
        name: partier[4].name,
        partiLetter: partier[4].partiLetter,
        votes: partier[4].votes
    }

    const liberalAlliance = {
        partiId: partier[5].partiId,
        name: partier[5].name,
        partiLetter: partier[5].partiLetter,
        votes: partier[5].votes
    }

    const kristendemokraterne = {
        partiId: partier[6].partiId,
        name: partier[6].name,
        partiLetter: partier[6].partiLetter,
        votes: partier[6].votes
    }

    const danskFolkeparti = {
        partiId: partier[7].partiId,
        name: partier[7].name,
        partiLetter: partier[7].partiLetter,
        votes: partier[7].votes
    }

    const venstre = {
        partiId: partier[8].partiId,
        name: partier[8].name,
        partiLetter: partier[8].partiLetter,
        votes: partier[8].votes
    }

    const frihedslisten = {
        partiId: partier[9].partiId,
        name: partier[9].name,
        partiLetter: partier[9].partiLetter,
        votes: partier[9].votes
    }

    const enhedslisten = {
        partiId: partier[10].partiId,
        name: partier[10].name,
        partiLetter: partier[10].partiLetter,
        votes: partier[10].votes
    }

    //kandidat excel data
    let data = [{ name: "	Kirsten Jensen	", votes: 2811, parti: socialdemokratiet },
    { name: "	Thomas Brücker	", votes: 210, parti: socialdemokratiet },
    { name: "	Louise Colding	", votes: 290, parti: socialdemokratiet },
    { name: "	Susanne Due Kristensen	", votes: 356, parti: socialdemokratiet },
    { name: "	Jamil Cheheibar	", votes: 145, parti: socialdemokratiet },
    { name: "	Mie Lausten	", votes: 292, parti: socialdemokratiet },
    { name: "	Vivi Wøldike	", votes: 140, parti: socialdemokratiet },
    { name: "	Mathilde Clauson-Kaas	", votes: 251, parti: socialdemokratiet },
    { name: "	Mustafa Adham	", votes: 82, parti: socialdemokratiet },
    { name: "	Niels Nedergaard	", votes: 63, parti: socialdemokratiet },
    { name: "	Jens Græsted	", votes: 37, parti: socialdemokratiet },
    { name: "	Emil Colding Sørensen	", votes: 84, parti: socialdemokratiet },
    { name: "	Ingo Hvid	", votes: 96, parti: socialdemokratiet },
    { name: "	Heidi Liljedahl	", votes: 22, parti: socialdemokratiet },
    { name: "	Kenneth Østed	", votes: 23, parti: socialdemokratiet },
    { name: "	Nanna Kjær	", votes: 89, parti: socialdemokratiet },
    { name: "	Peder Bisgaard	", votes: 154, parti: socialdemokratiet },
    { name: "	Christina Thorholm	", votes: 640, parti: radikaleVenstre },
    { name: "	Jørgen Suhr	", votes: 334, parti: radikaleVenstre },
    { name: "	Charlotte Kaufmanas	", votes: 58, parti: radikaleVenstre },
    { name: "	Mette Grønvaldt	", votes: 122, parti: radikaleVenstre },
    { name: "	Anne Lintrup	", votes: 96, parti: radikaleVenstre },
    { name: "	Lasse K. Rasmussen	", votes: 15, parti: radikaleVenstre },
    { name: "	Peter Ingemann Bentsen	", votes: 472, parti: konservativeFolkeparti },
    { name: "	Nikolaj Frederiksen	", votes: 323, parti: konservativeFolkeparti },
    { name: "	Stine Østlund	", votes: 313, parti: konservativeFolkeparti },
    { name: "	Christoffer Lorenzen	", votes: 831, parti: konservativeFolkeparti },
    { name: "	Kate Horsbøl	", votes: 186, parti: konservativeFolkeparti },
    { name: "	Jonas Lyberg Kofod	", votes: 183, parti: konservativeFolkeparti },
    { name: "	Lars Bennetzen	", votes: 43, parti: konservativeFolkeparti },
    { name: "	Jannick Holm	", votes: 38, parti: konservativeFolkeparti },
    { name: "	Lars W. Hansen	", votes: 57, parti: konservativeFolkeparti },
    { name: "	Brian Nedergaard	", votes: 82, parti: konservativeFolkeparti },
    { name: "	Anders Theisen	", votes: 64, parti: konservativeFolkeparti },
    { name: "	Manuel Vigilius	", votes: 143, parti: konservativeFolkeparti },
    { name: "	Niels Bang-Ebbestrup	", votes: 26, parti: konservativeFolkeparti },
    { name: "	Henrik Taankvist	", votes: 27, parti: konservativeFolkeparti },
    { name: "	Anni Nielsen	", votes: 12, parti: konservativeFolkeparti },
    { name: "	Poul Rohlin Nielsen	", votes: 27, parti: konservativeFolkeparti },
    { name: "	Morten Bille	", votes: 587, parti: nyeBorgerlige },
    { name: "	John S. Falch	", votes: 21, parti: nyeBorgerlige },
    { name: "	Martin Vinther	", votes: 117, parti: nyeBorgerlige },
    { name: "	Kenn Hadberg	", votes: 31, parti: nyeBorgerlige },
    { name: "	Lars Elbrandt	", votes: 452, parti: socialistiskFolkeparti },
    { name: "	Janne Lunding Olsen	", votes: 349, parti: socialistiskFolkeparti },
    { name: "	Mads Munk Hansen	", votes: 307, parti: socialistiskFolkeparti },
    { name: "	Rasmus Alexander Meyer	", votes: 86, parti: socialistiskFolkeparti },
    { name: "	Flemming Thornæs	", votes: 62, parti: socialistiskFolkeparti },
    { name: "	Rikke Macholm	", votes: 260, parti: socialistiskFolkeparti },
    { name: "	Michael Liesk	", votes: 149, parti: socialistiskFolkeparti },
    { name: "	Silje Brynildsen	", votes: 35, parti: socialistiskFolkeparti },
    { name: "	Søren Lerche	", votes: 976, parti: socialistiskFolkeparti },
    { name: "	Laila Dall	", votes: 76, parti: socialistiskFolkeparti },
    { name: "	Peter Langer	", votes: 190, parti: socialistiskFolkeparti },
    { name: "	Elisabeth Stieper Tofte	", votes: 230, parti: liberalAlliance },
    { name: "	Ulrik Ringgaard Mathorne	", votes: 12, parti: liberalAlliance },
    { name: "	Martin Plambæk	", votes: 26, parti: liberalAlliance },
    { name: "	Henrik Forsberg	", votes: 106, parti: kristendemokraterne },
    { name: "	Lars Ole Skovgaard Larsen	", votes: 610, parti: danskFolkeparti },
    { name: "	Jette Juul	", votes: 293, parti: danskFolkeparti },
    { name: "	Henning Westermann	", votes: 30, parti: danskFolkeparti },
    { name: "	Klaus Markussen	", votes: 1233, parti: venstre },
    { name: "	Dan Riise	", votes: 438, parti: venstre },
    { name: "	Peter Frederiksen	", votes: 255, parti: venstre },
    { name: "	Annette Rieva	", votes: 378, parti: venstre },
    { name: "	Øzgen Yücel	", votes: 356, parti: venstre },
    { name: "	Hanne Kirkegaard	", votes: 347, parti: venstre },
    { name: "	Thomas Elong	", votes: 538, parti: venstre },
    { name: "	Ole Roed Jakobsen	", votes: 177, parti: venstre },
    { name: "	Louise Diamant	", votes: 19, parti: venstre },
    { name: "	Dragan Popovic	", votes: 403, parti: venstre },
    { name: "	Pernille Svarre	", votes: 171, parti: venstre },
    { name: "	Frederik Bang	", votes: 44, parti: venstre },
    { name: "	Peter Lennø	", votes: 10, parti: venstre },
    { name: "	Mathias Skarby	", votes: 156, parti: venstre },
    { name: "	Camilla Kerlauge	", votes: 32, parti: venstre },
    { name: "	Ole Stark	", votes: 65, parti: venstre },
    { name: "	Thomas Petersen	", votes: 17, parti: venstre },
    { name: "	René Hamberg	", votes: 11, parti: venstre },
    { name: "	Jens Estrup	", votes: 124, parti: venstre },
    { name: "	René Christensen	", votes: 17, parti: venstre },
    { name: "	Lorna Birgitte Rudd	", votes: 108, parti: venstre },
    { name: "	Sven Lynge	", votes: 21, parti: venstre },
    { name: "	Torben Rønne Petersen	", votes: 6, parti: venstre },
    { name: "	Bjarne Holm	", votes: 52, parti: frihedslisten },
    { name: "	Tue Tortzen	", votes: 622, parti: enhedslisten },
    { name: "	Sabri Yilmaz	", votes: 220, parti: enhedslisten },
    { name: "	Anne Mette Isabel Nielsen	", votes: 203, parti: enhedslisten },
    { name: "	Hildur Johnson	", votes: 146, parti: enhedslisten },
    { name: "	Karl Erik Rasmussen	", votes: 37, parti: enhedslisten }];

    console.log("Please wait while we POST")
    //post
    for (let i = 0; i < data.length; i++) {
        await fetch(valgAPI + "/kandidat", {
            method: "POST",
            body: JSON.stringify(data[i]),
            headers: { "Content-type": "application/json; charset=UTF-8" }
        })
    }

    console.log("Initial kandidates created")


}
