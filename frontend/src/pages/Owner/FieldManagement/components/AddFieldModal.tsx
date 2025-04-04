import React from 'react';
import { Modal, Form, Input, Typography, Button } from 'antd';
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import type { FormInstance } from 'antd/es/form';

const { Text } = Typography;

interface AddFieldModalProps {
  visible: boolean;
  onClose: () => void;
  onAddField: () => void;
  form: FormInstance;
}

const AddFieldModal: React.FC<AddFieldModalProps> = ({
  visible,
  onClose,
  onAddField,
  form
}) => {
  return (
    <Modal
      title="Thêm sân mới"
      open={visible}
      onCancel={onClose}
      onOk={onAddField}
      okText="Thêm sân"
      cancelText="Hủy"
    >
      <Form
        form={form}
        layout="vertical"
      >
        <Form.List
          name="fields"
          initialValue={['']}
          rules={[
            {
              validator: async (_, fields) => {
                if (!fields || fields.length === 0) {
                  return Promise.reject(new Error('Vui lòng thêm ít nhất một sân'));
                }
                return Promise.resolve();
              },
            },
          ]}
        >
          {(fields, { add, remove }, { errors }) => (
            <>
              {fields.map((field, index) => (
                <Form.Item
                  required={false}
                  key={field.key}
                  label={index === 0 ? "Tên sân" : ""}
                >
                  <Form.Item
                    {...field}
                    validateTrigger={["onChange", "onBlur"]}
                    rules={[
                      {
                        required: true,
                        whitespace: true,
                        message: "Vui lòng nhập tên sân hoặc xóa trường này",
                      },
                      { 
                        min: 2, 
                        message: 'Tên sân phải có ít nhất 2 ký tự' 
                      }
                    ]}
                    noStyle
                  >
                    <Input 
                      placeholder="Nhập tên sân (VD: Sân số 1)"
                      style={{ width: "90%" }}
                    />
                  </Form.Item>
                  {fields.length > 1 ? (
                    <MinusCircleOutlined
                      className="dynamic-delete-button"
                      style={{ margin: '0 8px' }}
                      onClick={() => remove(field.name)}
                    />
                  ) : null}
                </Form.Item>
              ))}
              
              <Form.Item>
                <Button
                  type="dashed"
                  onClick={() => add()}
                  icon={<PlusOutlined />}
                  style={{ width: "100%" }}
                >
                  Thêm sân khác
                </Button>
                <Form.ErrorList errors={errors} />
              </Form.Item>
            </>
          )}
        </Form.List>
        
        <div style={{ marginTop: '16px', padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
          <Text type="secondary">
            Lưu ý: Việc thêm sân mới đồng nghĩa với việc bạn xác nhận sân này có thực và thuộc quyền quản lý của cơ sở. 
            Bạn chịu hoàn toàn trách nhiệm về tính xác thực của thông tin này.
          </Text>
        </div>
      </Form>
    </Modal>
  );
};

export default AddFieldModal; 