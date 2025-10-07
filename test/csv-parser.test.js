const { parseCSV, parseCSVLine } = require('../lib/csv-to-issues')

describe('CSV Parser', () => {
  describe('parseCSVLine', () => {
    test('should parse simple CSV line', () => {
      const line = 'Title,Description,Priority'
      const result = parseCSVLine(line)
      expect(result).toEqual(['Title', 'Description', 'Priority'])
    })

    test('should handle quoted fields', () => {
      const line = '"Complex Title","Description with, comma","High"'
      const result = parseCSVLine(line)
      expect(result).toEqual(['Complex Title', 'Description with, comma', 'High'])
    })

    test('should handle mixed quoted and unquoted fields', () => {
      const line = 'Simple,"Complex, with comma",Simple'
      const result = parseCSVLine(line)
      expect(result).toEqual(['Simple', 'Complex, with comma', 'Simple'])
    })

    test('should trim whitespace', () => {
      const line = ' Title , Description , Priority '
      const result = parseCSVLine(line)
      expect(result).toEqual(['Title', 'Description', 'Priority'])
    })
  })

  describe('parseCSV', () => {
    test('should parse complete CSV with headers', () => {
      const csvContent = `Title,Description,Priority
"Bug Fix","Fix the login issue","High"
"Feature","Add new dashboard","Medium"`

      const result = parseCSV(csvContent)
      expect(result).toHaveLength(2)
      expect(result[0]).toEqual({
        Title: 'Bug Fix',
        Description: 'Fix the login issue',
        Priority: 'High'
      })
      expect(result[1]).toEqual({
        Title: 'Feature',
        Description: 'Add new dashboard',
        Priority: 'Medium'
      })
    })

    test('should handle empty CSV', () => {
      const csvContent = 'Title,Description,Priority'
      const result = parseCSV(csvContent)
      expect(result).toHaveLength(0)
    })

    test('should skip malformed rows', () => {
      const csvContent = `Title,Description,Priority
"Bug Fix","Fix the login issue","High"
"Incomplete row","Missing field"
"Feature","Add new dashboard","Medium"`

      const result = parseCSV(csvContent)
      expect(result).toHaveLength(2)
      expect(result[0].Title).toBe('Bug Fix')
      expect(result[1].Title).toBe('Feature')
    })
  })
})