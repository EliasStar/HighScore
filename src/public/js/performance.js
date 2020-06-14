{
    const sportElem = document.querySelector("select[name=sport]");
    const studentElem = document.querySelector("select[name=student]");

    sportElem.addEventListener("change", () => {
        if (studentElem.value === "") {
            getContainer(`/private/new/performance/${sportElem.value}`);
        } else {
            getContainer(`/private/new/performance/${sportElem.value}/${studentElem.value}`);
        }
    });
}