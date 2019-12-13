
const base_url = process.env.REACT_APP_API_URL;

export const logProfile = (id, phase, actualTime, baseTime, startTime, commitTime, interactions) => {
        if (phase==='mount') {
            console.log(`${id}'s ${phase} phase:`);
            console.log(`Actual time: ${actualTime}`);
            // console.log(`Base time: ${baseTime}`);
            // console.log(`Start time: ${startTime}`);
            // console.log(`Commit time: ${commitTime}`);
            // console.log(`Interactions:`, interactions);
            fetch(`${base_url}/api/v1/performance/frontend/`, {
            method: 'POST',
            headers: {
                'Content-Type' : 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('idToken')
            },
            body: JSON.stringify({
                name:id,
                actualTime: actualTime
            })
        })
            .then(res => res.json())
            .catch(err => console.error(err))

        }
    };



