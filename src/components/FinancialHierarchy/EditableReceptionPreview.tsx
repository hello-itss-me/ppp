import React, { useState } from 'react'
import { ChevronDown, ChevronRight, Edit, Trash2, Plus, Save, X } from 'lucide-react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'

export interface ReceptionItem {
  id: string
  item_description: string
  work_group: string
  transaction_type: string
  quantity: number
  price: number
  upd_document_id: string | null
}

export interface AcceptedMotor {
  id: string
  position_in_reception: number
  motor_service_description: string
  motor_inventory_number: string
  subdivision_id: string
  subdivisions: {
    id: string
    name: string
  }
  items: ReceptionItem[]
}

export interface Reception {
  id: string
  reception_number: string
  reception_date: string
  counterparty_id: string
  counterparties: {
    id: string
    name: string
  }
  motors: AcceptedMotor[]
}

interface EditableReceptionPreviewProps {
  reception: Reception
  onUpdateItem: (itemId: string, updates: Partial<ReceptionItem>) => Promise<void>
  onDeleteItem: (itemId: string) => Promise<void>
  onAddItem: (motorId: string, item: Omit<ReceptionItem, 'id' | 'upd_document_id'>) => Promise<void>
}

interface PositionItemProps {
  item: ReceptionItem
  onEdit: (itemId: string, field: keyof ReceptionItem, value: string | number) => void
  onSave: (itemId: string) => void
  onDelete: (itemId: string) => void
  isEditing: boolean
  editValues: Partial<ReceptionItem>
}

const PositionItem: React.FC<PositionItemProps> = ({
  item,
  onEdit,
  onSave,
  onDelete,
  isEditing,
  editValues,
}) => {
  const isLinked = !!item.upd_document_id
  const displayValues = isEditing ? { ...item, ...editValues } : item

  return (
    <div
      className={`flex items-center gap-2 py-2 px-3 rounded transition-colors ${
        isLinked ? 'bg-gray-100 border border-gray-300' : 'hover:bg-gray-50 border border-transparent'
      }`}
    >
      <div className="flex-grow grid grid-cols-12 gap-2 items-center">
        <div className="col-span-4">
          {!isLinked && isEditing ? (
            <Input
              value={displayValues.item_description}
              onChange={(e) => onEdit(item.id, 'item_description', e.target.value)}
              className="h-8 text-sm"
            />
          ) : (
            <p className="text-sm text-gray-900">{displayValues.item_description}</p>
          )}
        </div>
        <div className="col-span-2 text-sm text-gray-600">{displayValues.work_group}</div>
        <div className="col-span-2 text-sm text-gray-600">{displayValues.transaction_type}</div>
        <div className="col-span-1">
          {!isLinked && isEditing ? (
            <Input
              type="number"
              value={displayValues.quantity}
              onChange={(e) => onEdit(item.id, 'quantity', parseFloat(e.target.value) || 0)}
              className="h-8 text-sm"
            />
          ) : (
            <p className="text-sm text-gray-900">{displayValues.quantity}</p>
          )}
        </div>
        <div className="col-span-2">
          {!isLinked && isEditing ? (
            <Input
              type="number"
              value={displayValues.price}
              onChange={(e) => onEdit(item.id, 'price', parseFloat(e.target.value) || 0)}
              className="h-8 text-sm"
            />
          ) : (
            <p className="text-sm text-gray-900">{displayValues.price}</p>
          )}
        </div>
        <div className="col-span-1 flex gap-1 justify-end">
          {!isLinked && (
            <>
              {isEditing ? (
                <>
                  <button
                    onClick={() => onSave(item.id)}
                    className="p-1 text-green-600 hover:bg-green-50 rounded"
                    title="Сохранить"
                  >
                    <Save size={16} />
                  </button>
                  <button
                    onClick={() => onEdit(item.id, 'item_description', item.item_description)}
                    className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                    title="Отмена"
                  >
                    <X size={16} />
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => onEdit(item.id, 'item_description', item.item_description)}
                    className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                    title="Редактировать"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => onDelete(item.id)}
                    className="p-1 text-red-600 hover:bg-red-50 rounded"
                    title="Удалить"
                  >
                    <Trash2 size={16} />
                  </button>
                </>
              )}
            </>
          )}
          {isLinked && (
            <span className="text-xs text-gray-500 italic">В УПД</span>
          )}
        </div>
      </div>
    </div>
  )
}

interface TransactionGroupProps {
  type: string
  items: ReceptionItem[]
  editingItems: Record<string, Partial<ReceptionItem>>
  onEdit: (itemId: string, field: keyof ReceptionItem, value: string | number) => void
  onSave: (itemId: string) => void
  onDelete: (itemId: string) => void
}

const TransactionGroup: React.FC<TransactionGroupProps> = ({
  type,
  items,
  editingItems,
  onEdit,
  onSave,
  onDelete,
}) => {
  const [isExpanded, setIsExpanded] = useState(true)

  if (items.length === 0) return null

  const isIncome = type === 'Доходы'
  const textColor = isIncome ? 'text-green-800' : 'text-red-800'

  return (
    <div>
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between cursor-pointer py-1.5 px-2 hover:bg-gray-50 rounded"
      >
        <h4 className={`text-sm font-medium ${textColor} flex-grow`}>{type}</h4>
        <div className="flex items-center gap-2">
          <span className={`text-sm font-semibold ${textColor}`}>({items.length})</span>
          <button className="text-gray-600">
            {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="mt-1 space-y-1 pl-4">
          {items.map((item) => (
            <PositionItem
              key={item.id}
              item={item}
              onEdit={onEdit}
              onSave={onSave}
              onDelete={onDelete}
              isEditing={editingItems[item.id] !== undefined}
              editValues={editingItems[item.id] || {}}
            />
          ))}
        </div>
      )}
    </div>
  )
}

interface WorkGroupProps {
  workGroup: string
  items: ReceptionItem[]
  editingItems: Record<string, Partial<ReceptionItem>>
  onEdit: (itemId: string, field: keyof ReceptionItem, value: string | number) => void
  onSave: (itemId: string) => void
  onDelete: (itemId: string) => void
}

const WorkGroup: React.FC<WorkGroupProps> = ({
  workGroup,
  items,
  editingItems,
  onEdit,
  onSave,
  onDelete,
}) => {
  const [isExpanded, setIsExpanded] = useState(true)

  const incomeItems = items.filter((item) => item.transaction_type === 'Доходы')
  const expenseItems = items.filter((item) => item.transaction_type === 'Расходы')

  return (
    <div className="border-l-4 border-blue-400 pl-4">
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between cursor-pointer py-2 px-2 hover:bg-blue-50 rounded"
      >
        <h2 className="text-sm font-medium text-gray-800 flex-grow">{workGroup}</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">({items.length})</span>
          <button className="text-gray-600">
            {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="mt-2 space-y-2 pl-4">
          <TransactionGroup
            type="Доходы"
            items={incomeItems}
            editingItems={editingItems}
            onEdit={onEdit}
            onSave={onSave}
            onDelete={onDelete}
          />
          <TransactionGroup
            type="Расходы"
            items={expenseItems}
            editingItems={editingItems}
            onEdit={onEdit}
            onSave={onSave}
            onDelete={onDelete}
          />
        </div>
      )}
    </div>
  )
}

interface MotorGroupProps {
  motor: AcceptedMotor
  editingItems: Record<string, Partial<ReceptionItem>>
  onEdit: (itemId: string, field: keyof ReceptionItem, value: string | number) => void
  onSave: (itemId: string) => void
  onDelete: (itemId: string) => void
  onAdd: (motorId: string, item: Omit<ReceptionItem, 'id' | 'upd_document_id'>) => void
  newItem: Partial<ReceptionItem> | null
  onNewItemChange: (field: keyof ReceptionItem, value: string | number) => void
}

const MotorGroup: React.FC<MotorGroupProps> = ({
  motor,
  editingItems,
  onEdit,
  onSave,
  onDelete,
  onAdd,
  newItem,
  onNewItemChange,
}) => {
  const [isExpanded, setIsExpanded] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)

  const workGroupMap = new Map<string, ReceptionItem[]>()
  for (const item of motor.items) {
    if (!workGroupMap.has(item.work_group)) {
      workGroupMap.set(item.work_group, [])
    }
    workGroupMap.get(item.work_group)!.push(item)
  }

  const handleAdd = () => {
    if (!newItem?.item_description || !newItem?.work_group || !newItem?.transaction_type) {
      alert('Заполните все обязательные поля')
      return
    }
    onAdd(motor.id, {
      item_description: newItem.item_description as string,
      work_group: newItem.work_group as string,
      transaction_type: newItem.transaction_type as string,
      quantity: newItem.quantity || 1,
      price: newItem.price || 0,
    })
    setShowAddForm(false)
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-4">
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-t-lg cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <span className="flex items-center justify-center w-7 h-7 bg-blue-600 text-white rounded-full text-sm font-bold">
            {motor.position_in_reception}
          </span>
          <div>
            <h2 className="text-sm font-semibold text-gray-900">{motor.motor_service_description}</h2>
            <p className="text-xs text-gray-600">{motor.subdivisions.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">{motor.items.length} работ(ы)</span>
          <button className="text-gray-600">
            {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="px-4 pb-4 space-y-3">
          {Array.from(workGroupMap.entries()).map(([workGroup, workItems]) => (
            <WorkGroup
              key={workGroup}
              workGroup={workGroup}
              items={workItems}
              editingItems={editingItems}
              onEdit={onEdit}
              onSave={onSave}
              onDelete={onDelete}
            />
          ))}

          <div className="mt-4 pt-4 border-t border-gray-200">
            {!showAddForm ? (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowAddForm(true)}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Добавить работу
              </Button>
            ) : (
              <div className="p-3 bg-gray-50 rounded-lg space-y-2">
                <div className="grid grid-cols-12 gap-2">
                  <div className="col-span-4">
                    <Input
                      placeholder="Описание работы"
                      value={(newItem?.item_description as string) || ''}
                      onChange={(e) => onNewItemChange('item_description', e.target.value)}
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      placeholder="Группа работ"
                      value={(newItem?.work_group as string) || ''}
                      onChange={(e) => onNewItemChange('work_group', e.target.value)}
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="col-span-2">
                    <select
                      value={(newItem?.transaction_type as string) || 'Доходы'}
                      onChange={(e) => onNewItemChange('transaction_type', e.target.value)}
                      className="w-full h-8 text-sm border border-gray-300 rounded px-2"
                    >
                      <option value="Доходы">Доходы</option>
                      <option value="Расходы">Расходы</option>
                    </select>
                  </div>
                  <div className="col-span-1">
                    <Input
                      type="number"
                      placeholder="Кол-во"
                      value={(newItem?.quantity as number) || 1}
                      onChange={(e) => onNewItemChange('quantity', parseFloat(e.target.value) || 1)}
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      placeholder="Цена"
                      value={(newItem?.price as number) || 0}
                      onChange={(e) => onNewItemChange('price', parseFloat(e.target.value) || 0)}
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="col-span-1 flex gap-1">
                    <button
                      onClick={handleAdd}
                      className="p-1 bg-blue-600 text-white hover:bg-blue-700 rounded"
                      title="Добавить"
                    >
                      <Plus size={16} />
                    </button>
                    <button
                      onClick={() => setShowAddForm(false)}
                      className="p-1 bg-gray-300 text-gray-700 hover:bg-gray-400 rounded"
                      title="Отмена"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export const EditableReceptionPreview: React.FC<EditableReceptionPreviewProps> = ({
  reception,
  onUpdateItem,
  onDeleteItem,
  onAddItem,
}) => {
  const [editingItems, setEditingItems] = useState<Record<string, Partial<ReceptionItem>>>({})
  const [newItems, setNewItems] = useState<Record<string, Partial<ReceptionItem>>>({})

  const handleEdit = (itemId: string, field: keyof ReceptionItem, value: string | number) => {
    if (field === 'item_description' && editingItems[itemId] === undefined) {
      const item = reception.motors
        .flatMap((m) => m.items)
        .find((i) => i.id === itemId)
      if (item) {
        setEditingItems((prev) => ({
          ...prev,
          [itemId]: { ...item },
        }))
      }
    } else {
      setEditingItems((prev) => ({
        ...prev,
        [itemId]: {
          ...prev[itemId],
          [field]: value,
        },
      }))
    }
  }

  const handleSave = async (itemId: string) => {
    const updates = editingItems[itemId]
    if (!updates) return

    await onUpdateItem(itemId, updates)
    setEditingItems((prev) => {
      const newEditing = { ...prev }
      delete newEditing[itemId]
      return newEditing
    })
  }

  const handleDelete = async (itemId: string) => {
    if (!confirm('Вы уверены, что хотите удалить эту позицию?')) return
    await onDeleteItem(itemId)
  }

  const handleNewItemChange = (motorId: string, field: keyof ReceptionItem, value: string | number) => {
    setNewItems((prev) => ({
      ...prev,
      [motorId]: {
        ...prev[motorId],
        [field]: value,
      },
    }))
  }

  const handleAddItem = async (motorId: string, item: Omit<ReceptionItem, 'id' | 'upd_document_id'>) => {
    await onAddItem(motorId, item)
    setNewItems((prev) => {
      const updated = { ...prev }
      delete updated[motorId]
      return updated
    })
  }

  return (
    <div className="space-y-6">
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold text-gray-700 mb-2">Информация о приемке</h3>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Номер приемки:</span>
            <p className="font-medium">{reception.reception_number}</p>
          </div>
          <div>
            <span className="text-gray-500">Дата приемки:</span>
            <p className="font-medium">
              {new Date(reception.reception_date).toLocaleDateString('ru-RU')}
            </p>
          </div>
          <div>
            <span className="text-gray-500">Контрагент:</span>
            <p className="font-medium">{reception.counterparties.name}</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-gray-700">Двигатели ({reception.motors.length})</h3>
        {reception.motors.map((motor) => (
          <MotorGroup
            key={motor.id}
            motor={motor}
            editingItems={editingItems}
            onEdit={handleEdit}
            onSave={handleSave}
            onDelete={handleDelete}
            onAdd={handleAddItem}
            newItem={newItems[motor.id] || null}
            onNewItemChange={(field, value) => handleNewItemChange(motor.id, field, value)}
          />
        ))}
      </div>
    </div>
  )
}
