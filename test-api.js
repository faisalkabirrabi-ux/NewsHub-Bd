const test = async () => {
    const res = await fetch('https://saurav.tech/NewsAPI/top-headlines/category/general/us.json');
    console.log(res.status);
    const data = await res.json();
    console.log(data.totalResults);
};
test();
