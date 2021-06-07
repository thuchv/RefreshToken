const btn_get_data_with_auto = document.getElementById('get-data-with-auto');
const btn_get_data_without_auto = document.getElementById('get-data-without-auto');
const btn_get_token = document.getElementById('get-token');
const btn_results = document.getElementById('results');

//get token o localStorage
function getLocalToken() {
    const token = window.localStorage.getItem('token')
    console.log('token >>>', token);
    return token
}

//get token o refreshToken
function getLocalRefreshToken() {
    const token = window.localStorage.getItem('refreshToken')
    return token
}


//cau hinh axios
const instance = axios.create({
    baseURL: 'http://localhost:3000/',
    timeout: 300000,
    headers: {
        'Content-Type': 'application/json',
    }
})

instance.setToken = (token) => {
    instance.defaults.headers['x-access-token'] = token
    window.localStorage.setItem('token', token)
}

function getToken() {
    return instance.post('/login', {
        username: 'anonystick.com',
        password: 'anonystick.com',
    })
}

function refreshToken() {
    return instance.post('/token', {
        refreshToken: getLocalRefreshToken()
    })
}


function getDataWithAuto() {
    return instance.get('/users', {
        params: {
            auto: 'yes',
        },
        headers: {
            'x-access-token': getLocalToken() // headers token
        }

    })
}

function getDataWithOutAuto() {
    return instance.get('/users', {
        params: {
            auto: 'no'
        },
        headers: {
            'x-access-token': getLocalToken() // headers token
        }
    })
}

// getToken();

instance.interceptors.response.use((response) => {
    return response
}, async function (error) {
    const originalRequest = error.config;
    console.log("INTERCEPTOR----------------------------------- " + originalRequest.baseURL);

    if (error.response.status === 401 && !originalRequest._retry) {
        console.log("INTERCEPTOR---------------2-----------------------");
        originalRequest._retry = true;
        return refreshToken().then(rs => {
            console.log('get token refreshToken>>', rs.data)
            const { token } = rs.data;
            instance.setToken(token);
            originalRequest.headers['x-access-token'] = token
            originalRequest.baseURL = 'http://localhost:3000/';
            return instance(originalRequest)
        })
    }
    return Promise.reject(error);
});

// response parse
// instance.interceptors.response.use((response) => {
//     console.log("INTERCEPTOR----------------------------------- ");
//     const {code, auto} = response.data
//     console.log("INTERCEPTOR----------------------------------- " + code + ":" + auto);
//     if (code === 401) {
//         console.log("INTERCEPTOR-------------------2---------------- ");
//         if(auto === 'yes'){
//             console.log("INTERCEPTOR-----------------3------------------ ");
//             console.log('get new token using refresh token', getLocalRefreshToken())
//             return refreshToken().then(rs => {
//                 console.log('get token refreshToken>>', rs.data)
//                 const { token } = rs.data
//                 instance.setToken(token);
//                 const config = response.config
//                 config.headers['x-access-token'] = token
//                 config.baseURL = 'http://localhost:3000/'
//                 return instance(config)

//             })
//         }
//     }
//     return response
// }, error => {
//     console.warn('Error status', error.response.status)
//     // return Promise.reject(error)
//     if (error.response) {
//         return parseError(error.response.data)
//     } else {
//         return Promise.reject(error)
//     }
// })


//click login de lay token va refreshtoken

btn_get_token.addEventListener('click', () => {
    console.log('click get data');
    getToken().then(res => {
        const { status, token, refreshToken } = res.data
        if (status === 'Logged in') {
            window.localStorage.setItem('token', token)
            window.localStorage.setItem('refreshToken', refreshToken)
            return btn_results.textContent = `Token is ${token} \n and refreshToken is ${refreshToken}`
            // console.log(res.data);
        }
    })


})

//click tu dong lay du lieu khi token het han
btn_get_data_with_auto.addEventListener('click', () => {
    console.log('click get data');
    getDataWithAuto().then(res => {
        const { code, message, elements } = res.data;
        console.log(JSON.stringify(elements));
        return btn_results.textContent = JSON.stringify(elements)
    }).catch(err => {
        return btn_results.textContent = "loi roi";
    });
})

//click lay du lieu nhung token het han thi thong bao
btn_get_data_without_auto.addEventListener('click', () => {

    getDataWithOutAuto().then(res => {
        console.log('click get data btn_get_data_without_auto>>>', res.data);
        const { code, message, elements } = res.data
        if (code === 403) {
            return btn_results.textContent = message
        }
        if (code === 401) {
            return btn_results.textContent = message
        }

        return btn_results.textContent = JSON.stringify(elements)
    })
})

// getToken();
export default instance


console.log('hello');