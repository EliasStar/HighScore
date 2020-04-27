window.addEventListener('load', () => {
    document.getElementById('add-button').addEventListener('click', () => getContainer('/private/new/sport'));

    const genderElem = document.getElementById('gender');
    const classElem = document.getElementById('class');

    const onOptionChanged = () => {
        setParams({
            gender: genderElem.value,
            class: classElem.value
        });
        refreshContainer();
    }

    genderElem.addEventListener('change', onOptionChanged);
    classElem.addEventListener('change', onOptionChanged);

    setParams({
        gender: genderElem.value,
        class: classElem.value
    });
});
