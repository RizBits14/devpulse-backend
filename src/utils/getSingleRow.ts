const getSingleRow = <T>(rows: T[], errorMessage: string): T => {
    const row = rows[0]

    if (!row) {
        throw new Error(errorMessage)
    }

    return row
};

export default getSingleRow;